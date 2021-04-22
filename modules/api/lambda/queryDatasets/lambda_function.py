from itertools import zip_longest
import json
import os
import re

from api_response import bad_request, bundle_response, missing_parameter
from aws_utils import DynamodbClient, LambdaClient, S3Client
from cache_utils import Caches

BEACON_ID = os.environ['BEACON_ID']
DATASETS_TABLE_NAME = os.environ['DATASETS_TABLE']
MAX_COORD = 32000
MAXIMUM_RESPONSE_SIZE = 5000000
MIN_COORD = -1
RESPONSE_BUCKET = os.environ['RESPONSE_BUCKET']
CHROMOSOMES = [
    "1"
]
COLLATE_QUERIES = os.environ['COLLATE_QUERIES_LAMBDA']

INCLUDE_DATASETS_VALUES = {
    'ALL',
    'HIT',
    'MISS',
    'NONE',
}

os.environ['PATH'] += ':' + os.environ['LAMBDA_TASK_ROOT']

base_pattern = re.compile('[ACGTUMRWSYKVHDBN]+')

dynamodb = DynamodbClient()
aws_lambda = LambdaClient()
s3 = S3Client()


def call_collate_queries(datasets, query_details_list, query_combination,
                         page_details, sample_fields, include_datasets, IUPAC,
                         similar, responses):
    for dataset in datasets:
        responses.put(
            call_id=dataset['dataset_id'],
            function_name=COLLATE_QUERIES,
            function_kwargs={
                'dataset': dataset,
                'query_details_list': query_details_list,
                'query_combination': query_combination,
                'page_details': page_details,
                'sample_fields': sample_fields,
                'include_datasets': include_datasets,
                'similar': similar,
                'IUPAC': IUPAC,
            }
        )


def check_size(response, context):
    response_length = len(json.dumps(response, separators=(',', ':')))
    print(f"Response is {response_length} characters")
    if response_length > MAXIMUM_RESPONSE_SIZE:
        print("Response is too large, uploading to S3...")
        key = f'{context.function_name}/{context.aws_request_id}.json'
        s3.put_object_from_dict(RESPONSE_BUCKET, key, response)
        presigned_url = s3.generate_presigned_get_url(RESPONSE_BUCKET, key)
        return {
            's3Response': {
                'presignedUrl': presigned_url,
            },
        }
    return response


def get_datasets(assembly_id, reference_names, dataset_ids):
    datasets = dynamodb.query(
        TableName=DATASETS_TABLE_NAME,
        IndexName='assembly_index',
        ProjectionExpression=(
            'id,vcfLocations,annotationLocation,sampleCount,#name,description'
            ',updateDateTime'
        ),
        KeyConditionExpression='assemblyId = :assemblyId',
        ExpressionAttributeNames={
            '#name': 'name',
        },
        ExpressionAttributeValues={
            ':assemblyId': {'S': assembly_id}
        },
    )
    if dataset_ids:
        datasets = [i for i in datasets if i['id']['S'] in dataset_ids]
    vcf_chromosomes = get_vcf_chromosome_map(datasets, reference_names)
    translated_datasets = []
    for dataset in datasets:
        dataset_id = dataset['id']['S']
        vcf_locations = {vcf: vcf_chromosomes[vcf]
                         for vcf in dataset['vcfLocations']['SS']
                         if vcf_chromosomes[vcf]}
        annotation_location = dataset.get('annotationLocation',
                                          {'S': None})['S']
        try:
            dataset_details = {
                'annotation_location': annotation_location,
                'dataset_id': dataset_id,
                'description': dataset.get('description', {'S': None})['S'],
                'name': dataset['name']['S'],
                'updateDateTime': dataset['updateDateTime']['S'],
                'vcf_locations': vcf_locations,
                'sample_count': int(dataset['sampleCount']['N']),

            }
        except KeyError:
            # Dataset hasn't been summarised yet or is invalid, skip
            continue
        else:
            translated_datasets.append(dataset_details)
    return translated_datasets


def get_queries(multi_values):
    return [
        {
            'referenceName': reference_name,
            'referenceBases': reference_bases,
            'start': int_or_self(start),
            'end': int_or_self(end),
            'startMin': int_or_self(start_min),
            'startMax': int_or_self(start_max),
            'endMin': int_or_self(end_min),
            'endMax': int_or_self(end_max),
            'alternateBases': alternate_bases,
            'variantType': variant_type,
        }
        for (
            reference_name,
            reference_bases,
            start,
            end,
            start_min,
            start_max,
            end_min,
            end_max,
            alternate_bases,
            variant_type,
        ) in zip_longest_lists(
            multi_values.get('referenceName') or None,
            multi_values.get('referenceBases') or None,
            multi_values.get('start') or None,
            multi_values.get('end') or None,
            multi_values.get('startMin') or None,
            multi_values.get('startMax') or None,
            multi_values.get('endMin') or None,
            multi_values.get('endMax') or None,
            multi_values.get('alternateBases') or None,
            multi_values.get('variantType') or None,
        )
    ]


def get_query_details_list(queries):
    query_details_list = []
    for query_parameters in queries:
        start = query_parameters.get('start')
        if start is None:
            start_min = query_parameters['startMin']
            start_max = query_parameters['startMax']
            end_min = query_parameters['endMin']
            end_max = query_parameters['endMax']
            # Rely on bcftools to find anything that impacts the region
            # Even if it starts before region_start.
            region_start = min(start_max, end_min)
            region_end = start_max
        else:
            start_min = region_start = region_end = start
            end = query_parameters.get('end')
            if end is None:
                end = start
            end_min = end_max = end
        reference_bases = query_parameters['referenceBases']
        # account for the 1-based indexing of vcf files
        region_start += 1
        region_end += 1
        end_min += 1
        end_max += 1
        # Don't allow arbitrarily large region queries
        region_start = max(region_start, MIN_COORD)
        region_end = min(region_end, MAX_COORD)
        if reference_bases != 'N':
            # For specific reference bases region may be smaller
            max_offset = len(reference_bases) - 1
            end_max = min(region_end + max_offset, end_max)
            region_start = max(end_min - max_offset, region_start)
        query_details_list.append({
            'region_start': region_start,
            'region_end': region_end,
            'start_min': start_min,
            'end_min': end_min,
            'end_max': end_max,
            'reference_bases': reference_bases,
            'alternate_bases': query_parameters.get('alternateBases'),
            'variant_type': query_parameters.get('variantType'),
        })
    return query_details_list


def get_vcf_chromosome_map(datasets, chromosomes):
    all_vcfs = list(set(
        loc
        for d in datasets
        for loc in d['vcfLocations']['SS']
    ))
    vcf_chromosome_map = {}
    for vcf in all_vcfs:
        vcf_chromosome_map[vcf] = [
            "1"
            # We know each VCF contains only one chromosome, "1"
            for _ in chromosomes
        ]
    return vcf_chromosome_map


def int_or_self(prospective_int):
    try:
        return int(prospective_int)
    except (TypeError, ValueError):
        # Cannot be formatted as an integer, handle in validation
        return prospective_int


def query_datasets(parameters, context):
    response_dict = {
        'beaconId': BEACON_ID,
        'apiVersion': None,
        'alleleRequest': parameters,
    }
    validation_error = validate_request(parameters)
    if validation_error:
        return bad_request(validation_error, response_dict)

    responses = Caches(
        dynamodb_client=dynamodb,
        lambda_client=aws_lambda,
        s3_client=s3,
    )
    datasets = get_datasets(
        parameters['assemblyId'],
        [
            query['referenceName']
            for query in parameters['queries']
        ],
        parameters.get('datasetIds'),
    )

    query_details_list = get_query_details_list(parameters['queries'])
    page_details = {
        'page': parameters.get('page', 1),
        'page_size': parameters.get('pageSize'),
        'sortby': parameters.get('variantsSortby', 'pos'),
        'desc': bool(parameters.get('variantsDescending')),
    }
    include_datasets = parameters.get('includeDatasetResponses', 'NONE')
    IUPAC = parameters.get('IUPAC', 'True')
    similar = bool(parameters.get('similar'))
    call_collate_queries(datasets, query_details_list, parameters.get('queryCombination'),
                         page_details, parameters.get('sampleFields'), include_datasets, IUPAC,
                         similar, responses)
    dataset_responses = []
    exists = False
    for response in responses.collect_responses():
        result = response.result
        if not result or 'exists' not in result:
            # function errored out, ignore
            continue
        if not exists:
            if result['exists']:
                exists = True
                if include_datasets == 'NONE':
                    break
        if result.pop('include'):
            dataset_responses.append(result)
    dataset_responses.sort(key=lambda r: r['datasetId'])
    response_dict.update({
        'exists': exists,
        'datasetAlleleResponses': dataset_responses or None,
    })
    response_dict = check_size(response_dict, context)
    return bundle_response(200, response_dict)


def validate_queries(queries):
    if not queries:
        return "At least one query must be present"
    for parameters in queries:
        missing_parameters = set()
        try:
            reference_name = parameters['referenceName']
        except KeyError:
            return missing_parameter('referenceName')
        if not isinstance(reference_name, str):
            return "referenceName must be a string"
        if reference_name not in CHROMOSOMES:
            return "referenceName must be one of {}".format(','.join(CHROMOSOMES))

        try:
            reference_bases = parameters['referenceBases']
        except KeyError:
            return missing_parameter('referenceBases')
        if not isinstance(reference_name, str):
            return "referenceBases must be a string"
        if not base_pattern.fullmatch(reference_bases):
            return "referenceBases must be a sequence of IUPAC ambiguity codes, i.e. [ACGTUMRWSYKVHDBN]*"

        start = parameters.get('start')
        if start is None:
            missing_parameters.add('start')
        elif not isinstance(start, int):
            return "start must be an integer"

        end = parameters.get('end')
        if end is None:
            missing_parameters.add('end')
        else:
            if 'start' in missing_parameters:
                return "end may not be specified if start is not specified"
            if not isinstance(end, int):
                return "end must be an integer"
            if end < start:
                return "end must not be less than start"

        start_min = parameters.get('startMin')
        if start_min is None:
            if 'start' in missing_parameters:
                return missing_parameter('start', 'startMin')
            missing_parameters.add('startMin')
        else:
            if 'start' not in missing_parameters:
                return "Only one of start and startMin may be specified"
            if not isinstance(start_min, int):
                return "startMin must be an integer"

        start_max = parameters.get('startMax')
        if start_max is None:
            if 'start' in missing_parameters:
                return "If startMin is specified, startMax must also be specified"
            missing_parameters.add('startMax')
        elif not isinstance(start_max, int):
            return "startMax must be an integer"
        elif start_max < start_min:
            return "startMax must not be less than startMin"

        end_min = parameters.get('endMin')
        if end_min is None:
            if 'start' in missing_parameters:
                return "If startMin is specified, endMin must also be specified"
            missing_parameters.add('endMin')
        elif not isinstance(end_min, int):
            return "endMin must be an integer"
        elif end_min < start_min:
            return "endMin must not be less than startMin"

        end_max = parameters.get('endMax')
        if end_max is None:
            if 'start' in missing_parameters:
                return "If startMax is specified, endMax must also be specified"
            missing_parameters.add('endMax')
        elif not isinstance(end_max, int):
            return "endMax must be an integer"
        elif end_max < end_min:
            return "endMax must not be less than endMin"
        elif end_max < start_max:
            return "endMax must not be less than startMax"

        alternate_bases = parameters.get('alternateBases')
        if alternate_bases is None:
            missing_parameters.add('alternateBases')
        else:
            if not isinstance(alternate_bases, str):
                return "alternateBases must be a string"
            if not base_pattern.fullmatch(alternate_bases):
                return "alternateBases must be a sequence of IUPAC ambiguity codes, i.e. [ACGTUMRWSYKVHDBN]*"

        variant_type = parameters.get('variantType')
        if variant_type is None:
            if 'alternateBases' in missing_parameters:
                return missing_parameter('alternateBases', 'variantType')
            missing_parameters.add('variantType')

    return ''


def validate_request(parameters):
    queries = parameters['queries']
    query_errors = validate_queries(queries)
    if query_errors:
        return query_errors
    missing_parameters = set()

    try:
        assembly_id = parameters['assemblyId']
    except KeyError:
        return missing_parameter('assemblyId')
    if not isinstance(assembly_id, str):
        return "assemblyId must be a string"

    dataset_ids = parameters.get('datasetIds')
    if dataset_ids is None:
        missing_parameters.add('datasetIds')
    else:
        if not isinstance(dataset_ids, list):
            return "datasetIds must be an array"
        if not all(isinstance(dataset_id, str) for dataset_id in dataset_ids):
            return "datasetIds must be an array of strings"

    sample_fields = parameters.get('sampleFields')
    if sample_fields is None:
        missing_parameters.add('sampleFields')
    else:
        if not isinstance(sample_fields, list):
            return "sampleFields must be an array"
        if not all(isinstance(sample_field, str)
                   for sample_field in sample_fields):
            return "sampleFields must be an array of strings"

    include_datasets = parameters.get('includeDatasetResponses')
    if include_datasets is None:
        missing_parameters.add('includeDatasetResponses')
    elif include_datasets not in INCLUDE_DATASETS_VALUES:
        return "includeDatasetResponses must be one of {}".format(
            ', '.join(INCLUDE_DATASETS_VALUES))

    page = parameters.get('page')
    if page is None:
        missing_parameters.add('page')
    elif not isinstance(page, int):
        return "page must be an integer"
    elif page < 1:
        return "page must be 1 or greater"

    page_size = parameters.get('pageSize')
    if page_size is None:
        missing_parameters.add('pageSize')
    elif not isinstance(page_size, int):
        return "pageSize must be an integer"
    elif page_size < 0:
        return "pageSize cannot be negative"

    similar = parameters.get('similar')
    if similar is None:
        missing_parameters.add('similar')
    else:
        if similar not in (0, 1):
            return "similar must be 0 or 1"

    variants_sortby = parameters.get('variantsSortby')
    if variants_sortby is None:
        missing_parameters.add('variantsSortby')
    else:
        if not isinstance(variants_sortby, str):
            return "variantsSortby must be a string"

    variants_descending = parameters.get('variantsDescending')
    if variants_descending is None:
        missing_parameters.add('variantsDescending')
    else:
        if variants_descending not in (0, 1):
            return "variantsDescending must be 0 or 1"

    query_combination = parameters.get('queryCombination')
    if query_combination is not None:
        if not isinstance(query_combination, str):
            return "queryCombination must be a string"
        elif not all(c in '0123456789:&|!()' for c in query_combination):
            return (
                "if queryCombination is present, it must only include numerals,"
                " as well as the \":&|!()\" special characters"
            )
        elif any(
            (
                (char in '0123456789' and next_char in '(!')
                or (char in ':&|!(' and next_char in ':&|)')
                or (char == ')' and next_char in '0123456789!')
            )
            for char, next_char in (
                query_combination[i:i + 2]
                for i in range(len(query_combination) - 1)
            )
        ):
            return "queryCombination contains logical syntax errors"
        elif {
                int(s)
                for s in re.findall('[0-9]+', query_combination)
        } != set(range(len(queries))):
            return (
                "queryCombination must reference all and only existing queries"
            )
        elif any(
            None in (open_i, close_i) or close_i < open_i
            for open_i, close_i in zip_longest(
                (
                    open_match.start()
                    for open_match in re.finditer('\\(', query_combination)
                ),
                (
                    close_match.start()
                    for close_match in re.finditer('\\)', query_combination)
                ),
            )
        ):
            return (
                "All opening parentheses in queryCombination must have matching"
                " closing parentheses"
            )
        elif query_combination[0] not in '0123456789(!':
            return (
                "queryCombination must not start with an operator except \"!\""
            )
        elif query_combination[-1] not in '0123456789)':
            return "queryCombination must not end in an operator"
    return ''


def zip_longest_lists(*lists, fillvalue=None):
    return zip_longest(
        *(
            o if isinstance(o, list) else [o]
            for o in lists
        ),
        fillvalue=fillvalue,
    )


def lambda_handler(event, context):
    print('Event Received: {}'.format(json.dumps(event)))
    extra_params = {
        'beaconId': BEACON_ID,
    }
    if event['httpMethod'] == 'POST':
        event_body = event.get('body')
        if not event_body:
            return bad_request('No body sent with request.', extra_params)
        try:
            parameters = json.loads(event_body)
        except ValueError:
            return bad_request('Error parsing request body, Expected JSON.',
                               extra_params)
        parameters['queries'] = get_queries(parameters)
    else:  # method == 'GET'
        parameters = event['queryStringParameters']
        if not parameters:
            return bad_request('No query parameters sent with request.',
                               extra_params)
        multi_values = event['multiValueQueryStringParameters']
        parameters['queries'] = get_queries(multi_values)
        parameters['datasetIds'] = multi_values.get('datasetIds')
        parameters['sampleFields'] = multi_values.get('sampleFields')
        for int_field in ('page', 'pageSize', 'variantsDescending', 'similar'):
            if int_field in parameters:
                parameters[int_field] = int_or_self(parameters[int_field])
    return query_datasets(parameters, context)

from collections import Counter
import json
import math
from operator import itemgetter
import os
import re

from aws_utils import DynamodbClient, LambdaClient, S3Client
from cache_utils import Caches, cache_response


EXTRA_ANNOTATION_FIELDS = [
    'SIFT_score',
]
GET_ANNOTATIONS = os.environ['GET_ANNOTATIONS_LAMBDA']
GET_SAMPLE_METADATA = os.environ['GET_SAMPLE_METADATA_LAMBDA']
SPLIT_QUERY = os.environ['SPLIT_QUERY_LAMBDA']

dynamodb = DynamodbClient()
aws_lambda = LambdaClient()
s3 = S3Client()


def annotate_variants(variant_counts, all_annotations, dataset_sample_count):
    annotations = []
    variant_pattern = re.compile('([^0-9]+)([0-9]+)(.+)')
    for variant, sample_count in variant_counts.items():
        ref, pos, alt = variant_pattern.fullmatch(variant).groups()
        annotations.append({
            'pos': int(pos),
            'ref': ref,
            'alt': alt,
            'sampleCount': sample_count,
            'frequency': get_frequency(sample_count, dataset_sample_count),
            **all_annotations.get(variant, {}),
        })
    return annotations


def call_get_annotations(responses, annotation_location):
    kwargs = {
        'annotation_location': annotation_location,
        'fields': EXTRA_ANNOTATION_FIELDS,
    }
    responses.put(
        function_name=GET_ANNOTATIONS,
        function_kwargs=kwargs,
    )


def call_get_sample_metadata(responses, vcf_locations, sample_fields):
    kwargs = {
        'vcf_locations': vcf_locations,
        'sample_fields': sample_fields,
    }
    responses.put(
        function_name=GET_SAMPLE_METADATA,
        function_kwargs=kwargs,
    )


def call_split_query(responses, vcf_locations, query_details_list):
    for i, details in enumerate(query_details_list):
        kwargs = {
            'vcf_locations': {
                vcf: chroms[i]
                for vcf, chroms in vcf_locations.items()
            },
            'query_details': details,
        }
        responses.put(
            function_name=SPLIT_QUERY,
            function_kwargs=kwargs,
            call_id=i,
        )


def collate_query(dataset, query_details_list, query_combination, sample_fields,
                  page_details, include_datasets):
    vcf_locations = dataset['vcf_locations']
    dataset_sample_count = dataset['sample_count']
    responses = Caches(
        dynamodb_client=dynamodb,
        lambda_client=aws_lambda,
        s3_client=s3,
    )
    call_split_query(responses, vcf_locations, query_details_list)
    call_get_sample_metadata(responses, list(vcf_locations), sample_fields)
    call_get_annotations(responses, dataset['annotation_location'])

    all_splits, all_sample_metadata, all_annotations = get_results(responses)

    variant_counts = get_variants(all_splits.values())
    variants_info = annotate_variants(variant_counts, all_annotations,
                                      dataset_sample_count)
    pages, variants_subset = process_page(variants_info, page_details)
    samples = combine_queries(all_splits, query_combination,
                              all_sample_metadata['samples'].keys())
    sample_count = len(samples)
    exists = bool(samples)
    sample_metadata_counts = get_sample_metadata_counts(samples, all_sample_metadata)
    if (include_datasets == 'ALL' or (include_datasets == 'HIT' and exists)
            or (include_datasets == 'MISS' and not exists)):
        response_dict = {
            'callCount': sum([
                split['call_count']
                for split in all_splits.values()
            ]),
            'datasetId': dataset['dataset_id'],
            'error': None,
            'exists': exists,
            'externalUrl': None,
            # Note not allelic frequency, only sample frequency
            'frequency': get_frequency(sample_count, dataset_sample_count),
            'include': True,
            'info': {
                'datasetSampleCount': dataset_sample_count,
                'description': dataset['description'],
                'name': dataset['name'],
                'pages': pages,
                'sampleCounts': sample_metadata_counts,
                'variants': variants_subset,
            },
            'note': None,
            'sampleCount': sample_count,
            'variantCount': len(variant_counts),

        }
    else:
        response_dict = {
            'include': False,
            'exists': exists,
        }
    return response_dict


def combine_queries(all_splits, query_combination, all_sample_metadata_samples):
    split_samples = [
        {
            sample
            for variant_samples in all_splits[i]['variant_samples'].values()
            for sample in variant_samples
        }
        for i in range(len(all_splits))
    ]
    if query_combination is None:
        return list(split_samples[0].intersection(*split_samples[1:]))
    else:
        all_sample_set = set(all_sample_metadata_samples)
        samples = [None]
        operators = [lambda x: x]
        number_string = ''
        for c in query_combination:
            if c in '0123456789':
                number_string += c
                continue
            elif number_string:
                index = int(number_string)
                samples[-1] = operators.pop()(split_samples[index])
                number_string = ''
            if c in '&:':
                operators.append(samples[-1].intersection)
            elif c == '|':
                operators.append(samples[-1].union)
            elif c == '!':
                last_operator = operators.pop()
                operators.append(lambda x: last_operator(all_sample_set-x))
            elif c == '(':
                samples.append(None)
                operators.append(lambda x: x)
            elif c == ')':
                samples[-1] = operators.pop()(samples.pop())
        if number_string:
            index = int(number_string)
            samples[-1] = operators.pop()(split_samples[index])
        return list(samples.pop())


def get_frequency(samples, total_samples):
    raw_frequency = samples / total_samples
    decimal_places = math.ceil(math.log10(total_samples)) - 2
    rounded = round(100 * raw_frequency, decimal_places)
    if decimal_places <= 0:
        rounded = int(rounded)
    return rounded


def get_results(responses):
    all_splits = {}
    all_sample_metadata = {}
    all_annotations = {}
    for response in responses.collect_responses():
        result = response.result
        function_name = response.function_name
        if result is None:
            print(f"No result from call to {function_name}")
            raise Exception(repr(response.error))
        if function_name == GET_ANNOTATIONS:
            all_annotations = result
        elif function_name == GET_SAMPLE_METADATA:
            all_sample_metadata = result
        else:
            assert function_name == SPLIT_QUERY, "Unknown function name"
            all_splits[response.call_id] = response.result
    return all_splits, all_sample_metadata, all_annotations


def get_sample_metadata_counts(samples, all_sample_metadata):
    print("Counting samples for each field")
    details = all_sample_metadata['samples']
    sample_metadata = [
        details[sample]
        for sample in samples
    ]
    field_indexes = all_sample_metadata['field_indexes']
    counts = all_sample_metadata['counts']
    ids = 'ID' in counts
    if ids:
        del counts['ID']
    for field_name, sample_field_counts in counts.items():
        indexes = field_indexes[field_name]
        field_counts = Counter(
            tuple(
                sample[sub_field_i]
                for sub_field_i in indexes
            )
            for sample in sample_metadata
        )
        for field_vals, field_count in field_counts.items():
            last_dict = sample_field_counts
            for this_field in field_vals[:-1]:
                last_dict = last_dict[this_field]
            last_dict[field_vals[-1]][0] = field_count
    if ids:
        id_index = field_indexes['ID'][0]
        counts['ID'] = [
            sample[id_index]
            for sample in sample_metadata
        ]
    return counts


def get_variants(all_splits):
    variants = Counter()
    for split in all_splits:
        variants.update({
            variant: len(samples)
            for variant, samples in split['variant_samples'].items()
        })
    return variants


def process_page(variants, page_details):
    num_variants = len(variants)
    sortby = page_details['sortby']
    desc = page_details['desc']
    page_size = page_details['page_size']
    if page_size is None:
        page_size = num_variants
    page = page_details['page']
    print(f"Sorting by {sortby}, {'descending' if desc else 'ascending'}")
    variants.sort(key=itemgetter(sortby), reverse=desc)
    skip = (page-1) * page_size
    final_index = page * page_size
    print(f"Restricting {num_variants} annotations to the range"
          f" [{skip}:{final_index}]")
    pages = math.ceil(num_variants / page_size) if page_size else 1
    variants_subset = variants[skip:final_index]
    return pages, variants_subset


def lambda_handler(event, context):
    print('Event Received: {}'.format(json.dumps(event)))
    dataset = event['dataset']
    query_details_list = event['query_details_list']
    query_combination = event['query_combination']
    page_details = event['page_details']
    sample_fields = event['sample_fields']
    include_datasets = event['include_datasets']
    raw_response = collate_query(
        dataset=dataset,
        query_details_list=query_details_list,
        query_combination=query_combination,
        page_details=page_details,
        sample_fields=sample_fields,
        include_datasets=include_datasets,
    )
    response = cache_response(event, raw_response, dynamodb, s3)
    print('Returning response: {}'.format(json.dumps(response)))
    return response

import base64
from collections import Counter, defaultdict
import csv
import json
import math
from operator import itemgetter
import os
import queue
import re
import threading

import boto3
from botocore.exceptions import ClientError

from aws_utils import S3Client


EXTRA_ANNOTATION_FIELDS = {
    'Variant',  # For matching and calculating pos,ref,alt
    'SIFT_score',
}

CACHE_BUCKET = os.environ['CACHE_BUCKET']
CACHE_TABLE = os.environ['CACHE_TABLE']
COUNTRY_CODES_PATH = os.environ['LAMBDA_TASK_ROOT'] + '/country_codes.json'
MAXIMUM_RESPONSE_SIZE = 6000000
METADATA_TRANSLATIONS = {
    'State': 'Location',
}
PERFORM_QUERY = os.environ['PERFORM_QUERY_LAMBDA']
RESPONSE_BUCKET = os.environ['RESPONSE_BUCKET']
SPLIT_SIZE = int(os.environ['SPLIT_SIZE'])

aws_lambda = boto3.client('lambda')
dynamodb = boto3.client('dynamodb')
s3 = S3Client()

with open(COUNTRY_CODES_PATH) as country_codes_json:
    country_codes = json.load(country_codes_json)


def cache_response(response, dataset_id, query_args):
    response_body = json.dumps(response).encode()
    encoded_query = base64.urlsafe_b64encode(query_args.encode())
    safe_query = encoded_query.decode().strip('=')
    key = f'{dataset_id}/{safe_query}'
    s3.put_object(CACHE_BUCKET, key, response_body)
    kwargs = {
        'TableName': CACHE_TABLE,
        'Item': {
            'datasetId': {
                'S': dataset_id,
            },
            'queryArgs': {
                'S': query_args,
            },
            'queryLocation': {
                'S': key
            }
        },
    }
    print(f"Calling dynamodb.put_item with kwargs {json.dumps(kwargs)}")
    dynamodb_response = dynamodb.put_item(**kwargs)
    response_string = json.dumps(dynamodb_response, default=str)
    print(f"Received response {response_string}")


def check_size(response, context):
    response_length = len(json.dumps(response))
    print(f"Response is {response_length} characters")
    if response_length > MAXIMUM_RESPONSE_SIZE:
        print("Response is too large, uploading to S3...")
        key = f'{context.function_name}/{context.aws_request_id}.json'
        s3.put_object(RESPONSE_BUCKET, key,
                      json.dumps(response).encode())
        return {
            's3Response': {
                'bucket': RESPONSE_BUCKET,
                'key': key,
            },
        }
    return response


def get_cached(dataset_id, query_args):
    kwargs = {
        'TableName': CACHE_TABLE,
        'Key': {
            'datasetId': {
                'S': dataset_id
            },
            'queryArgs': {
                'S': query_args,
            },
        },
        'ProjectionExpression': 'queryLocation',
    }
    print(f"Calling dynamodb.get_item with kwargs: {json.dumps(kwargs)}")
    response = dynamodb.get_item(**kwargs)
    print(f"Received response {json.dumps(response)}")
    item = response.get('Item')
    if not item:
        return None
    query_location = item['queryLocation']['S']
    try:
        streaming_body = s3.get_object(CACHE_BUCKET, query_location)
    except ClientError as error:
        print(json.dumps(error.response, default=str))
        return None
    return json.load(streaming_body)


def get_frequency(samples, total_samples):
    raw_frequency = samples / total_samples
    decimal_places = math.ceil(math.log10(total_samples)) - 2
    rounded = round(100 * raw_frequency, decimal_places)
    if decimal_places <= 0:
        rounded = int(rounded)
    return rounded


def get_annotations(annotation_location, variants):
    annotations = []
    covered_variants = set()
    if annotation_location:
        bucket, key = get_bucket_and_key(annotation_location)
        streaming_body = s3.get_object(bucket, key)
        iterator = (row.decode('utf-8') for row in streaming_body.iter_lines())
        reader = csv.DictReader(iterator, delimiter='\t')
        for row in reader:
            if row['Variant'] in variants:
                annotations.append({
                    metadata: value
                    for metadata, value in row.items()
                    if (value not in {'.', ''}
                        and metadata in EXTRA_ANNOTATION_FIELDS)
                })
                covered_variants.add(row['Variant'])
    annotations += [
        {
            'Variant': variant,
        }
        for variant in variants
        if variant not in covered_variants
    ]
    return annotations


def get_bucket_and_key(s3_location):
    delim_index = s3_location.find('/', 5)
    bucket = s3_location[5:delim_index]
    key = s3_location[delim_index + 1:]
    return bucket, key


def perform_query(region, reference_bases, end_min, end_max, alternate_bases,
                  variant_type, include_details, vcf_location, responses):
    payload = json.dumps({
        'region': region,
        'reference_bases': reference_bases,
        'end_min': end_min,
        'end_max': end_max,
        'alternate_bases': alternate_bases,
        'variant_type': variant_type,
        'include_details': include_details,
        'vcf_location': vcf_location,
    })
    print("Invoking {lambda_name} with payload: {payload}".format(
        lambda_name=PERFORM_QUERY, payload=payload))
    response = aws_lambda.invoke(
        FunctionName=PERFORM_QUERY,
        Payload=payload,
    )
    response_json = response['Payload'].read()
    print("vcf_location='{vcf}', region='{region}':"
          " received payload: {payload}".format(
              vcf=vcf_location, region=region, payload=response_json))
    response_dict = json.loads(response_json)
    # For separating samples by vcf
    response_dict['vcf_location'] = vcf_location
    responses.put(response_dict)


def process_page(response, page_details):
    variants = response['info']['variants']
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
    response['info'].update({
        'variants': variants[skip:final_index],
        'pages': math.ceil(num_variants / page_size),
    })


def process_samples(variants, fields):
    vcf_offsets = {}
    all_sample_details = []
    included_samples = set()
    uncompressed_variants = {}

    for variant, location_samples in variants.items():
        variant_samples = set()
        for vcf_location, sample_indexes in location_samples.items():
            if vcf_location not in vcf_offsets:
                bucket, key = get_bucket_and_key(vcf_location)
                key = f'{key.split(".")[0]}.csv'
                try:
                    streaming_body = s3.get_object(bucket, key)
                except ClientError as error:
                    print(error.response)
                    # Could not access sample metadata, skip
                    offset = -1
                else:
                    offset = len(all_sample_details)
                    iterator = (row.decode('utf-8')
                                for row in streaming_body.iter_lines())
                    reader = csv.DictReader(iterator)
                    print(f"Found csv with headers: {reader.fieldnames}")
                    print(f"Extracting {fields}")
                    all_sample_details += [
                        [
                            sample.get(METADATA_TRANSLATIONS.get(field, field))
                            for field in fields
                        ]
                        for sample in reader
                    ]
                vcf_offsets.update({vcf_location: offset})
            else:
                offset = vcf_offsets[vcf_location]
            if offset == -1:  # Couldn't access this metadata
                continue
            variant_samples.update(
                s_i + offset
                for s_i in sample_indexes
            )
        uncompressed_variants[variant] = variant_samples
        included_samples |= variant_samples

    extra_fields = {}

    for field_i, field in enumerate(fields):
        if field == 'Location':
            # Convert to Country only
            for sample in all_sample_details:
                location = sample[field_i]
                if location and isinstance(location, str):
                    # Clean data of known errors
                    country = location.split('/')[0].strip(' \u200e').lower()
                    sample[field_i] = country_codes[country]
                else:
                    sample[field_i] = None
            location_counts_dict = Counter(
                sample[field_i]
                for sample in all_sample_details
            )
            extra_fields['locationCounts'] = [
                {
                    location: count,
                }
                for location, count in location_counts_dict.items()
            ]
        elif field == 'SampleCollectionDate':
            # Convert to months only
            for sample in all_sample_details:
                date = sample[field_i]
                if date and isinstance(date, str) and len(date) >= 7:
                    sample[field_i] = date[:7]
                else:
                    sample[field_i] = "Date Missing"
            date_counts_dict = Counter(
                sample[field_i]
                for sample in all_sample_details
            )
            extra_fields['dateCounts'] = sorted(
                [
                    {
                        date: count,
                    }
                    for date, count in date_counts_dict.items()
                ],
                key=lambda x: list(x.keys())[0]
            )
        elif field == 'State':
            # Convert to Country / State only
            for sample in all_sample_details:
                location = sample[field_i]
                if location and isinstance(location, str):
                    sample[field_i] = '/'.join(location.split('/')[0:2]).strip(' \u200e').lower()
                else:
                    sample[field_i] = None
            state_counts_dict = Counter(
                sample[field_i]
                for sample in all_sample_details
            )
            extra_fields['stateCounts'] = [
                {
                    state: count,
                }
                for state, count in state_counts_dict.items()
            ]

    if {'SampleCollectionDate', 'Location'} <= set(fields):
        location_i = fields.index('Location')
        date_i = fields.index('SampleCollectionDate')
        location_date_counts_dict = Counter(
            (sample[location_i], sample[date_i])
            for sample in all_sample_details
        )
        location_date_counts = defaultdict(list)
        for (loc, date), count in location_date_counts_dict.items():
            location_date_counts[loc].append({date: count})
        for date_counts in location_date_counts.values():
            date_counts.sort(key=lambda x: list(x.keys())[0])
        extra_fields['locationDateCounts'] = location_date_counts

    if {'SampleCollectionDate', 'State'} <= set(fields):
        state_i = fields.index('State')
        date_i = fields.index('SampleCollectionDate')
        state_date_counts_dict = Counter(
            (sample[state_i], sample[date_i])
            for sample in all_sample_details
        )
        state_date_counts = defaultdict(list)
        for (state, date), count in state_date_counts_dict.items():
            state_date_counts[state].append({date: count})
        for date_counts in state_date_counts.values():
            date_counts.sort(key=lambda x: list(x.keys())[0])
        extra_fields['stateDateCounts'] = state_date_counts

    compression_mapping = []
    offset = 0
    for i in range(len(all_sample_details)):
        if i in included_samples:
            new_index = i - offset
        else:
            new_index = -1
            offset += 1
        compression_mapping.append(new_index)

    compressed_variants = {
        variant: [
            compression_mapping[s_i]
            for s_i in sample_indexes
        ]
        for variant, sample_indexes in uncompressed_variants.items()
    }
    sample_details = [
        sample
        for index, sample in enumerate(all_sample_details)
        if compression_mapping[index] != -1
    ]
    return sample_details, compressed_variants, extra_fields


def run_queries(dataset, query_details):
    responses = queue.Queue()
    region_start = query_details['region_start']
    region_end = query_details['region_end']
    end_min = query_details['end_min']
    end_max = query_details['end_max']
    reference_bases = query_details['reference_bases']
    alternate_bases = query_details['alternate_bases']
    variant_type = query_details['variant_type']
    include_datasets = query_details['include_datasets']
    sample_fields = query_details['sample_fields']
    check_all = include_datasets in ('HIT', 'ALL')
    kwargs = {
        'reference_bases': reference_bases,
        'end_min': end_min,
        'end_max': end_max,
        'alternate_bases': alternate_bases,
        'variant_type': variant_type,
        # Don't bother recording details from MISS, they'll all be 0s
        'include_details': check_all,
        'responses': responses,
    }
    threads = []
    split_start = region_start
    vcf_locations = dataset['vcf_locations']
    while split_start <= region_end:
        split_end = min(split_start + SPLIT_SIZE - 1, region_end)
        for vcf_location, chrom in vcf_locations.items():
            kwargs['region'] = '{}:{}-{}'.format(chrom, split_start,
                                                 split_end)
            kwargs['vcf_location'] = vcf_location
            t = threading.Thread(target=perform_query,
                                 kwargs=kwargs)
            t.start()
            threads.append(t)
        split_start += SPLIT_SIZE

    num_threads = len(threads)
    processed = 0
    all_alleles_count = 0
    variants = defaultdict(lambda: defaultdict(set))
    call_count = 0
    vcf_samples = defaultdict(set)
    exists = False
    while processed < num_threads and (check_all or not exists):
        response = responses.get()
        processed += 1
        if 'exists' not in response:
            # function errored out, ignore
            continue
        exists_in_split = response['exists']
        if exists_in_split:
            exists = True
            if check_all:
                all_alleles_count += response['all_alleles_count']
                call_count += response['call_count']
                vcf_location = response['vcf_location']
                for variant, samples in response['variant_samples'].items():
                    variants[variant][vcf_location].update(samples)
                    vcf_samples[vcf_location].update(samples)
    dataset_sample_count = dataset['sample_count']
    if (include_datasets == 'ALL' or (include_datasets == 'HIT' and exists)
            or (include_datasets == 'MISS' and not exists)):
        annotations = get_annotations(dataset['annotation_location'], variants.keys())
        variant_pattern = re.compile('([0-9]+)(.+)>(.+)')
        variant_codes = []
        for annotation in annotations:
            variant_code = annotation.pop('Variant')
            variant_codes.append(variant_code)
            pos, ref, alt = variant_pattern.fullmatch(variant_code).groups()
            variant_sample_count = sum(
                len(s) for s in variants[variant_code].values()
            )
            annotation.update({
                'pos': int(pos),
                'ref': ref,
                'alt': alt,
                'sampleCount': variant_sample_count,
                'frequency': get_frequency(variant_sample_count, dataset_sample_count),
            })
        sample_count = sum(len(samples)
                           for samples in vcf_samples.values())
        response_dict = {
            'include': True,
            'datasetId': dataset['dataset_id'],
            'exists': exists,
            # Note not allelic frequency, only sample frequency
            'frequency': get_frequency(sample_count, dataset_sample_count),
            'variantCount': len(variants),
            'callCount': call_count,
            'sampleCount': sample_count,
            'note': None,
            'externalUrl': None,
            'info': {
                'description': dataset['description'],
                'name': dataset['name'],
                'datasetSampleCount': dataset_sample_count,
                'variants': annotations,
                'totalEntries': len(annotations),
            },
            'error': None,
        }
        if sample_fields:
            (sample_details, compressed_variants,
             extra_fields) = process_samples(variants, sample_fields)
            response_dict['info'].update({
                'sampleFields': sample_fields,
                'sampleDetails': sample_details,
            })
            response_dict['info'].update(extra_fields)
            for code, variant in zip(variant_codes,
                                     response_dict['info']['variants']):
                variant['samples'] = compressed_variants[code]
    else:
        response_dict = {
            'include': False,
            'exists': exists,
        }
    return response_dict


def split_query(dataset, query_details, page_details):
    dataset_id = dataset['dataset_id']
    query_args = '&'.join(str(arg) for arg in query_details.values())
    response = get_cached(dataset_id, query_args)
    if response is None:
        response = run_queries(dataset, query_details)
        cache_response(response, dataset_id, query_args)
    if response['include']:
        process_page(response, page_details)
    return response


def lambda_handler(event, context):
    print('Event Received: {}'.format(json.dumps(event)))
    dataset = event['dataset']
    query_details = event['query_details']
    page_details = event['page_details']
    response = split_query(
        dataset=dataset,
        query_details=query_details,
        page_details=page_details,
    )
    response = check_size(response, context)
    print('Returning response: {}'.format(json.dumps(response)))
    return response

import base64
from collections import defaultdict
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


EXTRA_ANNOTATION_FIELDS = {
    'Variant',  # For matching and calculating pos,ref,alt
    'SIFT_score',
}

CACHE_BUCKET = os.environ['CACHE_BUCKET']
CACHE_TABLE = os.environ['CACHE_TABLE']
PERFORM_QUERY = os.environ['PERFORM_QUERY_LAMBDA']
SPLIT_SIZE = int(os.environ['SPLIT_SIZE'])

aws_lambda = boto3.client('lambda')
dynamodb = boto3.client('dynamodb')
s3 = boto3.client('s3')


def cache_response(response, dataset_id, query_args):
    response_body = json.dumps(response).encode()
    encoded_query = base64.urlsafe_b64encode(query_args.encode())
    safe_query = encoded_query.decode().strip('=')
    key = f'{dataset_id}/{safe_query}'
    kwargs = {
        'Bucket': CACHE_BUCKET,
        'Key': key,
        'Body': truncate_body(response_body),
    }
    print(f"Calling s3.put_item with kwargs: {json.dumps(kwargs)}")
    kwargs['Body'] = response_body
    s3_response = s3.put_object(**kwargs)
    print(f"Received response {json.dumps(s3_response, default=str)}")
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
        streaming_body = s3_get_object(CACHE_BUCKET, query_location)
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
        delim_index = annotation_location.find('/', 5)
        bucket = annotation_location[5:delim_index]
        key = annotation_location[delim_index+1:]
        streaming_body = s3_get_object(bucket, key)
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
        for annotation in annotations:
            variant_code = annotation.pop('Variant')
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
            },
            'error': None,
        }
    else:
        response_dict = {
            'include': False,
            'exists': exists,
        }
    return response_dict


def s3_get_object(bucket, key):
    kwargs = {
        'Bucket': bucket,
        'Key': key,
    }
    print(f"Calling s3.get_object with kwargs: {json.dumps(kwargs)}")
    response = s3.get_object(**kwargs)
    print(f"Received response: {json.dumps(response, default=str)}")
    return response['Body']


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


def truncate_body(body, head=100, tail=100):
    if len(body) > head + tail + 16:
        return (body[:head].decode()
                + f'...<{len(body) - head - tail} bytes>...'
                + body[-tail:].decode())
    else:
        return body.decode()


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
    print('Returning response: {}'.format(json.dumps(response)))
    return response

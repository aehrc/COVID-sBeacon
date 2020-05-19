import csv
import json
import os
import queue
import re
import threading

import boto3


SPLIT_SIZE = 1000000
PERFORM_QUERY = os.environ['PERFORM_QUERY_LAMBDA']

aws_lambda = boto3.client('lambda')
s3_client = boto3.client('s3')


def get_annotations(annotation_location, variants):
    annotations = []
    covered_variants = set()
    if annotation_location:
        delim_index = annotation_location.find('/', 5)
        bucket = annotation_location[5:delim_index]
        key = annotation_location[delim_index+1:]
        kwargs = {
            'Bucket': bucket,
            'Key': key,
        }
        print(f"Calling s3.get_object with kwargs: {json.dumps(kwargs)}")
        response = s3_client.get_object(**kwargs)
        print(f"Received response: {json.dumps(response, default=str)}")
        iterator = (row.decode('utf-8') for row in response['Body'].iter_lines())
        reader = csv.DictReader(iterator, delimiter='\t')
        for row in reader:
            if row['Variant'] in variants:
                annotations.append({
                    metadata: value
                    for metadata, value in row.items()
                    if value not in {'.', ''}
                })
                covered_variants.add(row['Variant'])
    annotations += [
        {
            'Variant': variant,
        }
        for variant in variants
        if variant not in covered_variants
    ]
    annotations.sort(key=variant_key)
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


def split_query(dataset_id, reference_bases, region_start,
                region_end, end_min, end_max, alternate_bases, variant_type,
                include_datasets, vcf_locations, annotation_location):
    responses = queue.Queue()
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
    variants = set()
    call_count = 0
    vcf_samples = {}
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
                variants.update(response['variants'])
                call_count += response['call_count']
                vcf_location = response['vcf_location']
                if vcf_location in vcf_samples:
                    vcf_samples[vcf_location].update(response['samples'])
                else:
                    vcf_samples[vcf_location] = set(response['samples'])
    if (include_datasets == 'ALL' or (include_datasets == 'HIT' and exists)
            or (include_datasets == 'MISS' and not exists)):
        response_dict = {
            'include': True,
            'datasetId': dataset_id,
            'exists': exists,
            'frequency': ((all_alleles_count or call_count and None)
                          and call_count / all_alleles_count),
            'variantCount': len(variants),
            'callCount': call_count,
            'sampleCount': sum(len(samples)
                               for samples in vcf_samples.values()),
            'note': None,
            'externalUrl': None,
            'info': {
                'variants': get_annotations(annotation_location, variants),
            },
            'error': None,
        }
    else:
        response_dict = {
            'include': False,
            'exists': exists,
        }
    return response_dict


def variant_key(variant_dict):
    variant = variant_dict['Variant']
    match = re.match('([0-9]+)', variant)
    return int(match.group()), variant[:match.end()]


def lambda_handler(event, context):
    print('Event Received: {}'.format(json.dumps(event)))
    dataset_id = event['dataset_id']
    reference_bases = event['reference_bases']
    region_start = event['region_start']
    region_end = event['region_end']
    end_min = event['end_min']
    end_max = event['end_max']
    alternate_bases = event['alternate_bases']
    variant_type = event['variant_type']
    include_datasets = event['include_datasets']
    vcf_locations = event['vcf_locations']
    annotation_location = event['annotation_location']
    response = split_query(
        dataset_id=dataset_id,
        reference_bases=reference_bases,
        region_start=region_start,
        region_end=region_end,
        end_min=end_min,
        end_max=end_max,
        alternate_bases=alternate_bases,
        variant_type=variant_type,
        include_datasets=include_datasets,
        vcf_locations=vcf_locations,
        annotation_location=annotation_location,
    )
    print('Returning response: {}'.format(json.dumps(response)))
    return response
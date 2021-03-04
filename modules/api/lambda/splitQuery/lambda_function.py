from collections import defaultdict
import json
import os


from aws_utils import DynamodbClient, LambdaClient, S3Client
from cache_utils import Caches, cache_response


MAX_COORD = 32000
MIN_COORD = -1
PERFORM_QUERY = os.environ['PERFORM_QUERY_LAMBDA']
SPLIT_SIZE = int(os.environ['SPLIT_SIZE'])

dynamodb = DynamodbClient()
aws_lambda = LambdaClient()
s3 = S3Client()


def call_perform_query(vcf_locations, query_details, IUPAC, responses):
    end_min = query_details['end_min']
    end_max = query_details['end_max']
    start_min = query_details['start_min']
    if end_min > end_max:
        # Region search will find nothing, don't bother.
        return
    kwargs = {
        'reference_bases': query_details['reference_bases'],
        'end_min': end_min,
        'end_max': end_max,
        'alternate_bases': query_details['alternate_bases'],
        'variant_type': query_details['variant_type'],
        'IUPAC': IUPAC,
    }
    region_start = max(query_details['region_start'], MIN_COORD)
    region_end = min(query_details['region_end'], MAX_COORD)
    # Allow valid variants (read: deletions and CNVs) that start before
    # the searched region. Only need the first region split to find these.
    start_earlier = True
    while region_start <= region_end:
        split_end = min(region_start + SPLIT_SIZE - 1, region_end)
        for vcf_i, (vcf_location, chrom) in enumerate(vcf_locations.items()):
            region = f'{chrom}:{region_start}-{split_end}'
            responses.put(
                function_name=PERFORM_QUERY,
                function_kwargs={
                    'region': region,
                    'start_min': start_min if start_earlier else region_start,
                    'vcf_location': vcf_location,
                    **kwargs,
                },
                call_id=(
                    vcf_i,
                    region,
                ),
            )
        region_start += SPLIT_SIZE
        start_earlier = False


def read_query_results(responses):
    call_count = 0
    vcf_variant_samples = defaultdict(lambda: defaultdict(list))
    for query in responses.collect_responses():
        vcf_i, _ = query.call_id
        query_result = query.result
        call_count += query_result['call_count']
        for variant, samples in query_result['variant_samples'].items():
            vcf_variant_samples[vcf_i][variant].append(samples)
    hit_samples = []
    variant_samplenum = defaultdict(int)
    for vcf_i, variant_samples in vcf_variant_samples.items():
        vcf_sample_set = set()
        for variant, samples in variant_samples.items():
            sample_set = set().union(*samples)
            variant_samplenum[variant] += len(sample_set)
            vcf_sample_set |= sample_set
        hit_samples += [
            f'{vcf_i}:{sample}'
            for sample
            in vcf_sample_set
        ]

    return call_count, variant_samplenum, hit_samples


def split_query(vcf_locations, query_details, IUPAC):
    responses = Caches(
        dynamodb_client=dynamodb,
        lambda_client=aws_lambda,
        s3_client=s3,
    )
    call_perform_query(vcf_locations, query_details, IUPAC, responses)
    call_count, variant_samplenum, hit_samples = read_query_results(responses)
    return {
        'call_count': call_count,
        'variant_samplenum': variant_samplenum,
        'hit_samples': hit_samples,
    }


def lambda_handler(event, context):
    print('Event Received: {}'.format(json.dumps(event)))
    vcf_locations = event['vcf_locations']
    query_details = event['query_details']
    IUPAC = event['IUPAC']
    raw_response = split_query(
        vcf_locations=vcf_locations,
        query_details=query_details,
        IUPAC=IUPAC,
    )
    response = cache_response(event, raw_response, dynamodb, s3)
    print('Returning response: {}'.format(json.dumps(response)))
    return response

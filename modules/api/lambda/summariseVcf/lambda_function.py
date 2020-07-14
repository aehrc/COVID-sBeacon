import json
import os
import subprocess

import boto3
from botocore.exceptions import ClientError

from chrom_matching import CHROMOSOMES, get_vcf_chromosomes, get_matching_chromosome

COUNTS = [
    'variantCount',
    'callCount',
    'sampleCount',
]

MAX_SLICE_SIZE_MBP = 20

SUMMARISE_SLICE_SNS_TOPIC_ARN = os.environ['SUMMARISE_SLICE_SNS_TOPIC_ARN']
VCF_SUMMARIES_TABLE_NAME = os.environ['VCF_SUMMARIES_TABLE']

os.environ['PATH'] += ':' + os.environ['LAMBDA_TASK_ROOT']

dynamodb = boto3.client('dynamodb')
s3 = boto3.client('s3')
sns = boto3.client('sns')


def get_etag(vcf_location):
    if not vcf_location.startswith('s3://'):
        return vcf_location
    delimiter_index = vcf_location.find('/', 5)
    kwargs = {
        'Bucket': vcf_location[5:delimiter_index],
        'Key': vcf_location[delimiter_index + 1:],
    }
    print(f"Calling s3.head_object with kwargs: {json.dumps(kwargs)}")
    response = s3.head_object(**kwargs)
    print(f"Received response: {json.dumps(response, default=str)}")
    return response['ETag'].strip('"')


def get_sample_count(location):
    args = [
        'bcftools', 'view',
        '--header-only',
        '--no-version',
        location
    ]
    header = subprocess.Popen(args, stdout=subprocess.PIPE, cwd='/tmp',
                              encoding='ascii')
    for line in header.stdout:
        if line.startswith('#CHROM'):
            header.stdout.close()
            # Get the number of tabs after the FORMAT column
            return max(line.count('\t') - 8, 0)
    # No header row, probably a bad file.
    raise ValueError("Incorrectly formatted file")


def get_translated_regions(location):
    vcf_chromosomes = get_vcf_chromosomes(location)
    regions = []
    for target_chromosome in CHROMOSOMES:
        chromosome = get_matching_chromosome(vcf_chromosomes, target_chromosome)
        if not chromosome:
            continue
        start = 0
        length, _ = vcf_chromosomes[chromosome]
        length_mbp = length / 1000000
        while start < length_mbp:
            mbp_left = (length_mbp - start)
            region_size = min(MAX_SLICE_SIZE_MBP, mbp_left)
            if int(region_size) == region_size:
                region_size = int(region_size)
            regions.append(('{}:{}'.format(chromosome, start),
                            region_size))
            start += region_size
    return regions


def mark_updating(location, vcf_regions, etag):
    kwargs = {
        'TableName': VCF_SUMMARIES_TABLE_NAME,
        'Key': {
            'vcfLocation': {
                'S': location,
            },
        },
        'UpdateExpression': 'SET toUpdate=:toUpdate, eTag=:eTag'
                            ' REMOVE ' + ', '.join(COUNTS),
        'ExpressionAttributeValues': {
            ':toUpdate': {
                'SS': [region for region, length_mbp in vcf_regions],
            },
            ':eTag': {
                'S': etag,
            },
        },
        'ConditionExpression': 'attribute_not_exists(toUpdate)',
    }
    print('Updating table: {}'.format(json.dumps(kwargs)))
    try:
        dynamodb.update_item(**kwargs)
    except ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            print("VCF location is already updating, aborting.")
            return False
        else:
            raise e
    return True


def publish_slice_updates(location, vcf_regions):
    kwargs = {
        'TopicArn': SUMMARISE_SLICE_SNS_TOPIC_ARN,
    }
    for region, length_mbp in vcf_regions:
        kwargs['Message'] = json.dumps({
            'location': location,
            'region': region,
            'slice_size_mbp': length_mbp,
        })
        print('Publishing to SNS: {}'.format(json.dumps(kwargs)))
        response = sns.publish(**kwargs)
        print('Received Response: {}'.format(json.dumps(response)))


def summarise_vcf(location):
    vcf_regions = get_translated_regions(location)
    etag = get_etag(location)
    start_update = mark_updating(location, vcf_regions, etag)
    if not start_update:
        return
    sample_count = get_sample_count(location)
    update_sample_count(location, sample_count)
    publish_slice_updates(location, vcf_regions)


def update_sample_count(location, sample_count):
    kwargs = {
        'TableName': VCF_SUMMARIES_TABLE_NAME,
        'Key': {
            'vcfLocation': {
                'S': location,
            },
        },
        'UpdateExpression': 'SET sampleCount=:sampleCount',
        'ExpressionAttributeValues': {
            ':sampleCount': {
                'N': str(sample_count),
            },
        },
    }
    print('Updating table: {}'.format(json.dumps(kwargs)))
    dynamodb.update_item(**kwargs)


def lambda_handler(event, context):
    print('Event Received: {}'.format(json.dumps(event)))
    location = event['Records'][0]['Sns']['Message']
    summarise_vcf(location)

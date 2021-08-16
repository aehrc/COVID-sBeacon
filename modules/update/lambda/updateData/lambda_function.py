import json
import os
import time

import requests
from aws_requests_auth.aws_auth import AWSRequestsAuth
import boto3

BEACON_URL = os.environ['BEACON_URL']
aws_access_key_id = os.environ['AWS_ACCESS_KEY_ID']
aws_secret_access_key = os.environ['AWS_SECRET_ACCESS_KEY']
aws_session_token = os.environ['AWS_SESSION_TOKEN']
#s3 = boto3.client('s3')
s3r = boto3.resource('s3')


def lambda_handler(event, context):
    print('Event Received: {}'.format(json.dumps(event)))

    bucket_name = event['Records'][0]['s3']['bucket']['name']
    # Wait for other objects to finish being uploaded
    time.sleep(45)
    bucket = s3r.Bucket(bucket_name)
    resp = list(bucket.objects.all())
    #print(files_in_bucket)
    all_keys = [d.key for d in resp]
    #print(test_all_keys)
    final_keys = [
        key
        for key in all_keys
        if key.startswith('gisaid/') and key.endswith('vcf.gz')
    ]
    locations = [
        f's3://{bucket_name}/{d}'
        for d in final_keys
    ]
    #print(test_keys)
    #resp = s3.list_objects_v2(Bucket=bucket_name)['Contents']

    #all_keys = [d['Key'] for d in resp]

    #final_keys = [
    #    key
    #    for key in all_keys
    #    if key.startswith('gisaid/') and key.endswith('vcf.gz')
    #]
    #locations = [
    #    f's3://{bucket_name}/{d}'
    #    for d in final_keys
    #]
    payload = {
        "id": "gisaid",
        "vcfLocations": locations,
    }
    api = BEACON_URL.split('/')[2]

    url = BEACON_URL + "/submit"
    auth = AWSRequestsAuth(
        aws_access_key=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        aws_token=aws_session_token,
        aws_host=api,
        aws_region='ap-southeast-2',
        aws_service='execute-api',
    )
    print(json.dumps(payload))
    response = requests.patch(url, data=json.dumps(payload), auth=auth)
    print((response))

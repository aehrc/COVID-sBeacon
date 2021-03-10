import json
import os
import requests
from aws_requests_auth.aws_auth import AWSRequestsAuth
import boto3
import time

BEACON_URL = os.environ['BEACON_URL']
aws_access_key_id = os.environ['AWS_ACCESS_KEY_ID']
aws_secret_access_key = os.environ['AWS_SECRET_ACCESS_KEY']
aws_session_token = os.environ['AWS_SESSION_TOKEN']
s3 = boto3.client('s3')

def lambda_handler(event, context):
    print('Event Received: {}'.format(json.dumps(event)))

    inputFileName = ""
    bucketName = ""
    for record in event['Records']:
      bucketName = record['s3']['bucket']['name']
      inputFileName = record['s3']['object']['key']
    bucket = bucketName+"/gisaid/"
    time.sleep(30)
    #if(len(s3.list_objects_v2(Bucket=bucket)['Contents']) == 2):
    resp = s3.list_objects_v2(Bucket=bucketName)['Contents']
    allKeys = [d['Key'] for d in resp]
    data = list(filter(lambda x: x.startswith("gisaid/"), allKeys))
    finalKeys = list(filter(lambda x: x.endswith("vcf.gz"), data))
    #print(finalKeys)
    location = ["s3://"+bucketName+"/"+d for d in finalKeys]
    #print(location)
    #location = "s3://"+bucketName+"/"+inputFileName
    payload = {"id": "gisaid","vcfLocations":location}
    #print(payload)
    api = BEACON_URL.split('/')[2]

    url = BEACON_URL + "/submit"
    auth = AWSRequestsAuth(aws_access_key=aws_access_key_id,
                           aws_secret_access_key=aws_secret_access_key,
                           aws_token=aws_session_token,
                           aws_host=api,
                           aws_region='ap-southeast-2',
                           aws_service='execute-api')
    response = requests.patch(url, data=json.dumps(payload), auth=auth)
    print(dir(response))
    #print(response.content)
    #print(response.headers)
    #print(response.json)
    #print(response.status_code)

import json
import os
import requests
from aws_requests_auth.aws_auth import AWSRequestsAuth
import boto3


BEACON_URL = os.environ['BEACON_URL']
aws_access_key_id = os.environ['AWS_ACCESS_KEY_ID']
aws_secret_access_key = os.environ['AWS_SECRET_ACCESS_KEY']
aws_session_token = os.environ['AWS_SESSION_TOKEN']

def lambda_handler(event, context):
    print('Event Received: {}'.format(json.dumps(event)))

    inputFileName = ""
    bucketName = ""
    for record in event['Records']:
      bucketName = record['s3']['bucket']['name']
      inputFileName = record['s3']['object']['key']

    location = "s3://"+bucketName+"/"+inputFileName
    payload = {"id": "gisaid","vcfLocations":[location]}

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
    print(response.content)
    print(response.headers)
    print(response.json)
    print(response.status_code)

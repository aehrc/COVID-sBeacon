import json
import os

import boto3


CACHE_KEY = os.environ['CACHE_KEY']
CACHE_LOC = os.environ['CACHE_LOC']
CACHE_BUCKET = os.environ['CACHE_BUCKET']
CACHE_TABLE = os.environ['CACHE_TABLE']

dynamodb = boto3.client('dynamodb')
s3 = boto3.client('s3')


def delete_from_dynamodb(keys):
    to_delete = []
    while keys:
        while len(to_delete) < 25 and keys:
            to_delete.append({
                'DeleteRequest': {
                    'Key': {
                        CACHE_KEY: keys.pop()
                    }
                }
            })
        kwargs = {
            'RequestItems': {
                CACHE_TABLE: to_delete,
            },
        }
        print("Calling dynamodb.batch_write_item with kwargs:"
              f" {json.dumps(kwargs)}")
        response = dynamodb.batch_write_item(**kwargs)
        print(f"Received response {json.dumps(response, default=str)}")
        to_delete = response['UnprocessedItems'].get(CACHE_TABLE, [])


def delete_s3_objects(keys):
    kwargs = {
        'Bucket': CACHE_BUCKET,
        'Delete': {}
    }
    while keys:
        kwargs['Delete']['Objects'] = [
            {'Key': key} for key in keys[:1000]
        ]
        keys = keys[1000:]
        kwargs_string = json.dumps(kwargs)
        print(f"Calling s3.delete_objects with kwargs: {kwargs_string}")
        response = s3.delete_objects(**kwargs)
        print(f"Received response {json.dumps(response, default=str)}")
        assert not response.get('Errors')


def get_dynamodb_details():
    kwargs = {
        'TableName': CACHE_TABLE,
        'ProjectionExpression': f'{CACHE_KEY},{CACHE_LOC}',
    }
    keys = []
    locations = []
    last_key = True
    while last_key:
        print("Calling dynamodb.scan with kwargs:"
              f" {json.dumps(kwargs)}")
        response = dynamodb.scan(**kwargs)
        print(f"Received response {json.dumps(response, default=str)}")
        keys += [
            row[CACHE_KEY]
            for row in response['Items']
        ]
        locations += [
            row[CACHE_LOC]['S']
            for row in response['Items']
        ]
        last_key = response.get('LastEvaluatedKey')
        kwargs['ExclusiveStartKey'] = last_key
    return keys, locations


def flush_cache():
    dynamodb_keys, s3_keys = get_dynamodb_details()
    delete_from_dynamodb(dynamodb_keys)
    delete_s3_objects(s3_keys)


def lambda_handler(event, context):
    print('Event Received: {}'.format(json.dumps(event)))
    flush_cache()

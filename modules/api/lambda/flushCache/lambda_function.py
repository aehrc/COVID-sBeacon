import json
import os

import boto3


CACHE_BUCKET = os.environ['CACHE_BUCKET']
CACHE_TABLE = os.environ['CACHE_TABLE']

dynamodb = boto3.client('dynamodb')
s3 = boto3.client('s3')


def delete_from_dynamodb(dataset_id, sort_keys):
    to_delete = []
    while sort_keys:
        while len(to_delete) < 25 and sort_keys:
            to_delete.append({
                'DeleteRequest': {
                    'Key': {
                        'datasetId': {
                            'S': dataset_id,
                        },
                        'queryArgs': sort_keys.pop()
                    }
                }
            })
        kwargs = {
            'RequestItems': {
                CACHE_TABLE: to_delete,
            },
        }
        print("Calling dynamodb.batch_write_item with kwargs"
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
        print(f"Calling s3.delete_objects with kwargs {kwargs_string}")
        response = s3.delete_objects(**kwargs)
        print(f"Received response {json.dumps(response, default=str)}")
        assert not response.get('Errors')


def get_dynamodb_keys(dataset_id):
    kwargs = {
        'TableName': CACHE_TABLE,
        'KeyConditionExpression': 'datasetId = :datasetId',
        'ProjectionExpression': 'queryArgs',
        'ExpressionAttributeValues': {
            ':datasetId': {
                'S': dataset_id,
            },
        },
    }
    sort_keys = []
    last_key = True
    while last_key:
        print("Calling dynamodb.query with kwargs"
              f" {json.dumps(kwargs)}")
        response = dynamodb.query(**kwargs)
        print(f"Received response {json.dumps(response, default=str)}")
        sort_keys += [
            row['queryArgs'] for row in response['Items']
        ]
        last_key = response.get('LastEvaluatedKey')
        kwargs['ExclusiveStartKey'] = last_key
    return sort_keys


def get_s3_keys(dataset_id):
    kwargs = {
        'Bucket': CACHE_BUCKET,
        'Prefix': f'{dataset_id}/'
    }
    keys = []
    continuation_token = True
    while continuation_token:
        kwargs_string = json.dumps(kwargs)
        print(f"Calling s3.list_objects_v2 with kwargs {kwargs_string}")
        response = s3.list_objects_v2(**kwargs)
        print(f"Received response {json.dumps(response, default=str)}")
        keys += [obj['Key'] for obj in response.get('Contents', [])]
        continuation_token = response.get('NextContinuationToken')
        kwargs['ContinuationToken'] = continuation_token
    return keys


def flush_bucket(dataset_id):
    keys = get_s3_keys(dataset_id)
    delete_s3_objects(keys)


def flush_cache(dataset_id):
    flush_table(dataset_id)
    flush_bucket(dataset_id)


def flush_table(dataset_id):
    sort_keys = get_dynamodb_keys(dataset_id)
    delete_from_dynamodb(dataset_id, sort_keys)


def lambda_handler(event, context):
    print('Event Received: {}'.format(json.dumps(event)))
    dataset_id = event['Records'][0]['Sns']['Message']
    flush_cache(dataset_id=dataset_id)

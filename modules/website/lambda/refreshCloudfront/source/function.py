import json
import os
import time

import boto3


DISTRIBUTION_ID = os.environ['DISTRIBUTION_ID']


cloudfront = boto3.client('cloudfront')


def refresh_cloudfront(key):
    kwargs = {
        'DistributionId': DISTRIBUTION_ID,
        'InvalidationBatch': {
            'Paths': {
                'Quantity': 1,
                'Items': [
                    '/' + key,
                ],
            },
            'CallerReference': str(round(time.time())),
        },
    }
    print('Calling cloudfront.create_invalidation with the following kwargs: '
          f'{json.dumps(kwargs)}')
    response = cloudfront.create_invalidation(**kwargs)
    print(f'Received response: {json.dumps(response, default=str)}')


def lambda_handler(event, context):
    print(f'Event Received: {json.dumps(event)}')
    s3_object = event['Records'][0]['s3']['object']
    refresh_cloudfront(s3_object['key'])

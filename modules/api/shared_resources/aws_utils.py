import json
import time

import boto3
import botocore


THROTTLE_DELAY = 1


class DynamodbClient:
    def __init__(self):
        dynamodb_config = botocore.config.Config(
            max_pool_connections=200,
            read_timeout=1,  # If it takes more than a second, something's wrong
            retries={
                'total_max_attempts': 3,
            }
        )
        self.client = boto3.client('dynamodb', config=dynamodb_config)

    def get_item(self, table, key, projection_expression):
        kwargs = {
            'TableName': table,
            'Key': key,
            'ProjectionExpression': projection_expression,
        }
        print(f"Calling dynamodb.get_item with kwargs: {json.dumps(kwargs)}")
        t = Timer()
        response = self.client.get_item(**kwargs)
        print(f"Received response after {t.str}: {json.dumps(response)}")
        return response.get('Item')

    def put_item(self, table, item):
        kwargs = {
            'TableName': table,
            'Item': item,
        }
        print(f"Calling dynamodb.put_item with kwargs: {json.dumps(kwargs)}")
        t = Timer()
        response = self.client.put_item(**kwargs)
        print(f"Received response after {t.str}: {json.dumps(response, default=str)}")

    def query(self, **kwargs):
        more_results = True
        items = []
        while more_results:
            print(f"Calling dynamodb.query with kwargs: {json.dumps(kwargs)}")
            t = Timer()
            response = self.client.query(**kwargs)
            print(f"Received response after {t.str}: {json.dumps(response, default=str)}")
            items += response.get('Items', [])
            last_evaluated = response.get('LastEvaluatedKey', {})
            if last_evaluated:
                kwargs['ExclusiveStartKey'] = last_evaluated
            else:
                more_results = False
        return items


class LambdaClient:
    def __init__(self):
        lambda_config = botocore.config.Config(
            read_timeout=300,
            max_pool_connections=200,
            retries={
                'total_max_attempts': 1,
            }
        )
        self.client = boto3.client('lambda', config=lambda_config)

    def invoke(self, name, kwargs):
        payload = json.dumps(kwargs)
        while True:
            print(f"Invoking {name} with payload: {payload}")
            t = Timer()
            try:
                response = self.client.invoke(
                    FunctionName=name,
                    Payload=payload,
                )
            except botocore.exceptions.ClientError as error:
                response = error.response
                print(f"Received error after {t.str}: {json.dumps(response, default=str)}")
                if response['Error']['Code'] == 'TooManyRequestsException':
                    print(f"Invocation was throttled, waiting {THROTTLE_DELAY}"
                          " second(s) before calling again.")
                    time.sleep(THROTTLE_DELAY)
                    continue
                else:
                    raise error
            else:
                print(f"Received response after {t.str}: {json.dumps(response, default=str)}")
                return response['Payload']


class S3Client:
    def __init__(self):
        s3_config = botocore.config.Config(
            max_pool_connections=200,
            retries={
                'total_max_attempts': 1,
            }
        )
        self.client = boto3.client('s3', config=s3_config)

    def generate_presigned_get_url(self, bucket, key, expires=3600):
        kwargs = {
            'ClientMethod': 'get_object',
            'Params': {
                'Bucket': bucket,
                'Key': key,
            },
            'ExpiresIn': expires,
        }
        print(f"Calling s3.generate_presigned_url with kwargs: {json.dumps(kwargs)}")
        t = Timer()
        response = self.client.generate_presigned_url(**kwargs)
        print(f"Received response after {t.str}: {json.dumps(response, default=str)}")
        return response

    def get_object(self, bucket, key):
        kwargs = {
            'Bucket': bucket,
            'Key': key,
        }
        print(f"Calling s3.get_object with kwargs: {json.dumps(kwargs)}")
        t = Timer()
        response = self.client.get_object(**kwargs)
        print(f"Received response after {t.str}: {json.dumps(response, default=str)}")
        return response['Body']

    def get_object_from_path(self, s3_location):
        delim_index = s3_location.find('/', 5)
        bucket = s3_location[5:delim_index]
        key = s3_location[delim_index + 1:]
        return self.get_object(bucket, key)

    def put_object_from_dict(self, bucket, key, data):
        body = json.dumps(data, separators=(',', ':')).encode()
        self.put_object(bucket, key, body, ContentType='application/json')

    def put_object(self, bucket, key, body, **other_kwargs):
        kwargs = dict(
            Bucket=bucket,
            Key=key,
            Body=self.truncate_body(body),
            **other_kwargs
        )
        print(f"Calling s3.put_item with kwargs: {json.dumps(kwargs)}")
        kwargs['Body'] = body
        t = Timer()
        s3_response = self.client.put_object(**kwargs)
        print(f"Received response after {t.str}: {json.dumps(s3_response, default=str)}")

    @staticmethod
    def truncate_body(body, head=100, tail=100):
        if len(body) > head + tail + 16:
            return (body[:head].decode()
                    + f'...<{len(body) - head - tail} bytes>...'
                    + body[-tail:].decode())
        else:
            return body.decode()


class Timer:
    def __init__(self):
        self.start_time = time.time()

    def passed(self):
        return int((time.time() - self.start_time) * 1000)

    @property
    def str(self):
        return f'{self.passed()}ms'

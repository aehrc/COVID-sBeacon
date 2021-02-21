import json

import boto3


class DynamodbClient:
    def __init__(self):
        self.client = boto3.client('dynamodb')

    def get_item(self, table, key, projection_expression):
        kwargs = {
            'TableName': table,
            'Key': key,
            'ProjectionExpression': projection_expression,
        }
        print(f"Calling dynamodb.get_item with kwargs: {json.dumps(kwargs)}")
        response = self.client.get_item(**kwargs)
        print(f"Received response {json.dumps(response)}")
        return response.get('Item')

    def put_item(self, table, item):
        kwargs = {
            'TableName': table,
            'Item': item,
        }
        print(f"Calling dynamodb.put_item with kwargs: {json.dumps(kwargs)}")
        response = self.client.put_item(**kwargs)
        print(f"Received response {json.dumps(response, default=str)}")

    def query(self, **kwargs):
        more_results = True
        items = []
        while more_results:
            print(f"Calling dynamodb.query with kwargs: {json.dumps(kwargs)}")
            response = self.client.query(**kwargs)
            print(f"Received response {json.dumps(response, default=str)}")
            items += response.get('Items', [])
            last_evaluated = response.get('LastEvaluatedKey', {})
            if last_evaluated:
                kwargs['ExclusiveStartKey'] = last_evaluated
            else:
                more_results = False
        return items


class LambdaClient:
    def __init__(self):
        self.client = boto3.client('lambda')

    def invoke(self, name, kwargs):
        payload = json.dumps(kwargs)
        print(f"Invoking {name} with payload: {payload}")
        response = self.client.invoke(
            FunctionName=name,
            Payload=payload,
        )
        print(f"Received response {json.dumps(response, default=str)}")
        return response['Payload']


class S3Client:
    def __init__(self):
        self.client = boto3.client('s3')

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
        response = self.client.generate_presigned_url(**kwargs)
        print(f"Received response: {json.dumps(response, default=str)}")
        return response

    def get_object(self, bucket, key):
        kwargs = {
            'Bucket': bucket,
            'Key': key,
        }
        print(f"Calling s3.get_object with kwargs: {json.dumps(kwargs)}")
        response = self.client.get_object(**kwargs)
        print(f"Received response: {json.dumps(response, default=str)}")
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
        s3_response = self.client.put_object(**kwargs)
        print(f"Received response {json.dumps(s3_response, default=str)}")

    @staticmethod
    def truncate_body(body, head=100, tail=100):
        if len(body) > head + tail + 16:
            return (body[:head].decode()
                    + f'...<{len(body) - head - tail} bytes>...'
                    + body[-tail:].decode())
        else:
            return body.decode()

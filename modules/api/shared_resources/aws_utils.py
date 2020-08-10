import json

import boto3


class S3Client:
    def __init__(self):
        self.client = boto3.client('s3')

    def get_object(self, bucket, key):
        kwargs = {
            'Bucket': bucket,
            'Key': key,
        }
        print(f"Calling s3.get_object with kwargs: {json.dumps(kwargs)}")
        response = self.client.get_object(**kwargs)
        print(f"Received response: {json.dumps(response, default=str)}")
        return response['Body']

    def put_object(self, bucket, key, body):
        kwargs = {
            'Bucket': bucket,
            'Key': key,
            'Body': self.truncate_body(body),
        }
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

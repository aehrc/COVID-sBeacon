import csv
import json

from aws_utils import DynamodbClient, S3Client
from cache_utils import cache_response


dynamodb = DynamodbClient()
s3 = S3Client()


def get_annotations(annotation_location, fields):
    streaming_body = s3.get_object_from_path(annotation_location)
    iterator = (row.decode('utf-8') for row in streaming_body.iter_lines())
    reader = csv.DictReader(iterator, delimiter='\t')
    return {
        row['Variant']: {
            field: value
            for field in fields
            if (value := row.get(field)) not in ('.', '', None)
        }
        for row in reader
    }


def lambda_handler(event, context):
    print('Event Received: {}'.format(json.dumps(event)))
    annotation_location = event['annotation_location']
    fields = event['fields']
    raw_response = get_annotations(
        annotation_location=annotation_location,
        fields=fields,
    )
    response = cache_response(event, raw_response, dynamodb, s3)
    print('Returning response: {}'.format(json.dumps(response)))
    return response

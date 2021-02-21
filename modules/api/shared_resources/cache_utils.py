import hashlib
import json
import os
import queue
import threading
import time
import typing
import uuid

from botocore.exceptions import ClientError


CACHE_DAYS = float(os.environ['CACHE_DAYS'])
CACHE_EXPIRY_KEY = os.environ['CACHE_EXPIRY_KEY']
CACHE_KEY = os.environ['CACHE_KEY']
CACHE_LOC = os.environ['CACHE_LOC']
CACHE_BUCKET = os.environ['CACHE_BUCKET']
CACHE_STRING = '_cache_string'
CACHE_TABLE = os.environ['CACHE_TABLE']
INVOCATION_ATTEMPTS = 2
RESPONSE_KEY = '_s3_location'


class CachedInvoke:
    def __init__(self, function_name, invoke_kwargs, dynamodb_client,
                 lambda_client, s3_client, call_id=None):
        self.call_id = call_id
        self.complete = False
        self._dynamodb = dynamodb_client
        self.error = None
        self.function_name = function_name
        self.invoke_kwargs = invoke_kwargs
        self._lambda_client = lambda_client
        self._location = None
        self.result = None
        self._s3 = s3_client

        self._cache_string = self._get_cache_string()

    def _get_cache_string(self):
        base_bytes = json.dumps(
            {
                self.function_name: self.invoke_kwargs
            },
            separators=(',', ':')
        ).encode()
        return '-'.join(
            h(base_bytes).hexdigest()
            for h in (hashlib.md5, hashlib.sha256)
        )

    def _set_location_from_dynamodb(self):
        item = self._dynamodb.get_item(
            table=CACHE_TABLE,
            key={
                CACHE_KEY: {
                    'S': self._cache_string,
                },
            },
            projection_expression=CACHE_LOC
        )
        if item is not None:
            self._location = item[CACHE_LOC]['S']

    def _set_location_from_invocation(self):
        full_invoke_kwargs = dict(self.invoke_kwargs,
                                  **{CACHE_STRING: self._cache_string})
        streaming_json = self._lambda_client.invoke(
            name=self.function_name,
            kwargs=full_invoke_kwargs
        )
        response = json.load(streaming_json)
        try:
            self._location = response[RESPONSE_KEY]
        except KeyError:
            self.error = response
            print(f"{json.dumps(response)}")

    def _get_result(self):
        if self._location is None:
            return
        try:
            streaming_body = self._s3.get_object(CACHE_BUCKET, self._location)
        except ClientError as error:
            print(json.dumps(error.response, default=str))
            self.error = error
            return
        self.result = json.load(streaming_body)
        self.complete = True

    def process(self, response_queue):
        print(f"Processing {self.function_name} (call_id={self.call_id})"
              f" with kwargs: {json.dumps(self.invoke_kwargs)}")
        self._set_location_from_dynamodb()
        self._get_result()
        if not self.complete:
            invocations = 0
            while not self.complete and invocations < INVOCATION_ATTEMPTS:
                self.error = None
                self._set_location_from_invocation()
                if self.error:
                    break
                invocations += 1
                self._get_result()
        print(f"Finished Processing {self.function_name}"
              f" (call_id={self.call_id}).")
        response_queue.put(self)


class Caches:
    def __init__(self, dynamodb_client, lambda_client, s3_client):
        self.dynamodb = dynamodb_client
        self.queue = queue.Queue()
        self.lambda_client = lambda_client
        self.num_threads = 0
        self.s3 = s3_client
        self.thread_kwargs = {
            'response_queue': self.queue
        }

    def put(self, function_name, function_kwargs, call_id=None):
        cached_invoke = CachedInvoke(
            function_name=function_name,
            invoke_kwargs=function_kwargs,
            dynamodb_client=self.dynamodb,
            lambda_client=self.lambda_client,
            s3_client=self.s3,
            call_id=call_id,
        )
        t = threading.Thread(
            target=cached_invoke.process,
            kwargs=self.thread_kwargs,
        )
        t.start()
        self.num_threads += 1

    def collect_responses(self) -> typing.Generator[CachedInvoke, None, None]:
        total_threads = 0
        while self.num_threads > 0:
            yield self.queue.get()
            self.num_threads -= 1
            total_threads += 1
        print(f"All {total_threads} responses collected.")


def cache_response(kwargs, response, dynamodb_client, s3_client):
    cache_string = kwargs[CACHE_STRING]
    s3_key = str(uuid.uuid4())
    s3_client.put_object_from_dict(
        bucket=CACHE_BUCKET,
        key=s3_key,
        data=response,
    )
    dynamodb_client.put_item(
        table=CACHE_TABLE,
        item={
            CACHE_KEY: {
                'S': cache_string
            },
            CACHE_LOC: {
                'S': s3_key
            },
            CACHE_EXPIRY_KEY: {
                'N': str(int(time.time() + 86400 * CACHE_DAYS))
            }
        },
    )
    return {
        RESPONSE_KEY: s3_key
    }

from collections import Counter
import csv
import json
import os

from aws_utils import S3Client

ALL_SAMPLE_FIELDS = os.environ['SAMPLE_FIELDS']
ARTIFACT_BUCKET = os.environ['ARTIFACT_BUCKET']
COMPOSITE_FIELD_SEPARATOR = '_'
COUNTRY_CODES_PATH = os.environ['LAMBDA_TASK_ROOT'] + '/country_codes.json'
KEY_SUFFIX = os.environ['SAMPLE_METADATA_SUFFIX']
STATE_SYNONYMS_RAW = {
    'Australia / Northern Territory': {
        'Australia / Northern territory',
    },
    'Australia / New South Wales': {
        'Australia / NSW',
    }
}

state_synonyms = {
    alias: true_name
    for true_name, aliases in STATE_SYNONYMS_RAW.items()
    for alias in aliases
}

with open(COUNTRY_CODES_PATH) as country_codes_json:
    country_codes = json.load(country_codes_json)

s3 = S3Client()


class CalculatedField:
    def __init__(self, all_raw_fields, base_field=None):
        self.json = self.set_json(*(
            all_raw_fields.get(raw_field)
            for raw_field in self.raw_fields(base_field)
        ))

    @classmethod
    def raw_fields(cls, base_field):
        return [base_field]

    @staticmethod
    def set_json(*raw_fields):
        return raw_fields[0] if raw_fields[0] else "null"


class CalculatedFieldId(CalculatedField):
    @classmethod
    def raw_fields(cls, base_field=None):
        return [
            'AccessionID',
            'RelatedID',
        ]

    @staticmethod
    def set_json(accession_id, related_id):
        if related_id is None:
            return accession_id
        for related in related_id.split(','):
            if related.startswith('EPI_ISL_'):
                return related
        return accession_id


class CalculatedFieldDate(CalculatedField):
    @classmethod
    def raw_fields(cls, base_field=None):
        return [
            'SampleCollectionDate',
        ]

    @staticmethod
    def set_json(date):
        if date and isinstance(date, str) and len(date) >= 7:
            return date[:7]
        else:
            return "Date Missing"


class CalculatedFieldLocation(CalculatedField):
    @classmethod
    def raw_fields(cls, base_field=None):
        return [
            'Location',
        ]

    @staticmethod
    def set_json(location):
        if location and isinstance(location, str):
            # Convert to Country only
            # Clean data of known errors
            country = location.split('/')[0].strip(' \u200e').lower()
            finalCountry  = country_codes.get(country)

            if finalCountry:
                return finalCountry
            else:
                return "None"
        else:
            return "null"


class CalculatedFieldState(CalculatedField):
    @classmethod
    def raw_fields(cls, base_field=None):
        return [
            'Location',
            'OriginatingLab',
        ]

    @staticmethod
    def set_json(location, originating_lab):
        if location and isinstance(location, str):
            state_name = '/'.join(location.split('/')[0:2]).strip(' \u200e')
            if state_name == 'Australia' and 'ACT' in originating_lab:
                return 'Australia / Australian Capital Territory'
            return state_synonyms.get(state_name, state_name)
        else:
            return "null"


CALCULATED_FIELDS = {
    'Date': CalculatedFieldDate,
    'ID': CalculatedFieldId,
    'Location': CalculatedFieldLocation,
    'SampleCollectionDate': CalculatedFieldDate,
    'State': CalculatedFieldState,
}


def count_metadata(base_fields, sample_fields, sample_metadata):
    counts = {}
    field_indexes = {}
    for sample_field in sample_fields:
        sub_fields = sample_field.split(COMPOSITE_FIELD_SEPARATOR)
        indexes = [
            base_fields.index(sub_field)
            for sub_field in sub_fields
        ]
        field_indexes[sample_field] = indexes
        print(f"Counting {sub_fields=}")
        count = Counter(
            tuple(
                sample[sub_field_i]
                for sub_field_i in indexes
            )
            for sample in sample_metadata.values()
        )
        print(f"Formatting counts")
        sample_field_counts = {}
        for field_vals, field_count in sorted(
            count.items(),
            key=lambda x: [
                f if f is not None else 'ZZZ' for f in x[0]
            ]
        ):
            last_dict = sample_field_counts
            for this_field in field_vals[:-1]:
                if this_field not in last_dict:
                    last_dict[this_field] = {}
                last_dict = last_dict[this_field]
            last_dict[field_vals[-1]] = [0, field_count]
        counts[sample_field] = sample_field_counts
    return field_indexes, counts


def get_base_fields(all_fields):
    return list({
        base_field
        for field in all_fields
        for base_field in field.split(COMPOSITE_FIELD_SEPARATOR)
    })


def get_individual_metadata(vcf_locations, base_fields):
    raw_fields = get_raw_fields(base_fields)

    raw_vcf_metadata = [
        get_vcf_metadata(vcf_location, raw_fields)
        for vcf_location in vcf_locations
    ]
    print("All raw fields extracted")
    return {
        f'{vcf_i}:{sample_i}': [
            get_field(field)(sample_raw_fields, field).json
            for field in base_fields
        ]
        for vcf_i, samples in enumerate(raw_vcf_metadata)
        for sample_i, sample_raw_fields in enumerate(samples)
    }


def get_field(base_field):
    return CALCULATED_FIELDS.get(base_field, CalculatedField)


def get_raw_fields(base_fields):
    return {
        raw_field
        for base_field in base_fields
        for raw_field in get_field(base_field).raw_fields(base_field)
    }


def get_sample_metadata(vcf_locations, sample_fields):
    base_fields = get_base_fields(sample_fields)
    sample_metadata = get_individual_metadata(vcf_locations, base_fields)
    print(f"Individual metadata for {len(sample_metadata)} samples calculated")
    print("Counting totals")
    field_indexes, counts = count_metadata(base_fields, sample_fields, sample_metadata)
    print("Formatting result")
    return {
        'counts': counts,
        'field_indexes': field_indexes,
        'samples': sample_metadata,
    }


def get_vcf_metadata(vcf_location, fields):
    metadata_location = f"{vcf_location.rsplit('.', 2)[0]}.csv"
    streaming_body = s3.get_object_from_path(metadata_location)
    iterator = (row.decode('utf-8') for row in streaming_body.iter_lines())
    reader = csv.DictReader(iterator)
    print(f"Found csv with headers: {reader.fieldnames}")
    print(f"Extracting {fields}")
    return [
        {
            field: row.get(field)
            for field in fields
        }
        for row in reader
    ]


def lambda_handler(event, context):
    print('Event Received: {}'.format(json.dumps(event)))
    event_dict = json.loads(event['Records'][0]['Sns']['Message'])
    dataset_id = event_dict['dataset_id']
    vcf_locations = event_dict['vcf_locations']
    response = get_sample_metadata(
        vcf_locations=vcf_locations,
        sample_fields=ALL_SAMPLE_FIELDS.split('&'),
    )
    s3.put_object_from_dict(
        bucket=ARTIFACT_BUCKET,
        key=f'{dataset_id}/{KEY_SUFFIX}',
        data=response,
    )

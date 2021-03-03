from collections import Counter
from itertools import combinations
import json
import math
from operator import itemgetter
import os
import re

from aws_utils import DynamodbClient, LambdaClient, S3Client
from cache_utils import Caches, cache_response


ARTIFACT_BUCKET = os.environ['ARTIFACT_BUCKET']
EXTRA_ANNOTATION_FIELDS = [
    'SIFT_score',
]
GET_ANNOTATIONS = os.environ['GET_ANNOTATIONS_LAMBDA']
MAX_SUBCOMBINATIONS_TO_CHECK = 10000
MAX_SUBCOMBINATIONS_TO_RETURN = 100
MAX_SUBCOMBINATIONS_DEPTH = 9
SAMPLE_METADATA_SUFFIX = os.environ['SAMPLE_METADATA_SUFFIX']
SPLIT_QUERY = os.environ['SPLIT_QUERY_LAMBDA']

dynamodb = DynamodbClient()
aws_lambda = LambdaClient()
s3 = S3Client()


def annotate_variants(variant_counts, all_annotations, dataset_sample_count):
    annotations = []
    variant_pattern = re.compile('([^0-9]+)([0-9]+)(.+)')
    for variant, sample_count in variant_counts.items():
        ref, pos, alt = variant_pattern.fullmatch(variant).groups()
        annotations.append({
            'pos': int(pos),
            'ref': ref,
            'alt': alt,
            'sampleCount': sample_count,
            'frequency': get_frequency(sample_count, dataset_sample_count),
            **all_annotations.get(variant, {}),
        })
    return annotations


def call_get_annotations(responses, annotation_location):
    kwargs = {
        'annotation_location': annotation_location,
        'fields': EXTRA_ANNOTATION_FIELDS,
    }
    responses.put(
        function_name=GET_ANNOTATIONS,
        function_kwargs=kwargs,
    )


def call_split_query(responses, vcf_locations, query_details_list, IUPAC):
    for i, details in enumerate(query_details_list):
        kwargs = {
            'vcf_locations': {
                vcf: chroms[i]
                for vcf, chroms in vcf_locations.items()
            },
            'query_details': details,
            'IUPAC': IUPAC,
        }
        responses.put(
            function_name=SPLIT_QUERY,
            function_kwargs=kwargs,
            call_id=i,
        )


def collate_query(dataset, query_details_list, query_combination, sample_fields,
                  page_details, include_datasets, IUPAC):
    vcf_locations = dataset['vcf_locations']
    dataset_sample_count = dataset['sample_count']
    responses = Caches(
        dynamodb_client=dynamodb,
        lambda_client=aws_lambda,
        s3_client=s3,
    )
    call_split_query(responses, vcf_locations, query_details_list, IUPAC)
    call_get_annotations(responses, dataset['annotation_location'])

    dataset_id = dataset['dataset_id']
    # Call this while we're waiting on splitQuery
    all_sample_metadata = get_all_sample_metadata(dataset_id, sample_fields)

    all_splits, all_annotations = get_results(responses)

    variant_counts = get_variants(all_splits.values())
    variants_info = annotate_variants(variant_counts, all_annotations,
                                      dataset_sample_count)
    pages, variants_subset = process_page(variants_info, page_details)
    samples, subcombinations = get_fuzzy_combinations(
        all_splits, query_combination, all_sample_metadata['samples'].keys(),
    )
    sample_count = len(samples)
    exists = bool(samples)
    sample_metadata_counts = get_sample_metadata_counts(samples, all_sample_metadata)
    if (include_datasets == 'ALL' or (include_datasets == 'HIT' and exists)
            or (include_datasets == 'MISS' and not exists)):
        response_dict = {
            'callCount': sum([
                split['call_count']
                for split in all_splits.values()
            ]),
            'datasetId': dataset_id,
            'error': None,
            'exists': exists,
            'externalUrl': None,
            # Note not allelic frequency, only sample frequency
            'frequency': get_frequency(sample_count, dataset_sample_count),
            'include': True,
            'info': {
                'datasetSampleCount': dataset_sample_count,
                'description': dataset['description'],
                'name': dataset['name'],
                'updateDateTime': dataset['updateDateTime'],
                'pages': pages,
                'sampleCounts': sample_metadata_counts,
                'subcombinations': subcombinations,
                'variants': variants_subset,
            },
            'note': None,
            'sampleCount': sample_count,
            'variantCount': len(variant_counts),

        }
    else:
        response_dict = {
            'include': False,
            'exists': exists,
        }
    return response_dict


def combine_queries(split_samples, query_combination, all_sample_set):
    samples = [None]
    operators = [lambda x: x]
    number_string = ''
    for c in query_combination:
        if c in '0123456789':
            number_string += c
            continue
        elif number_string:
            index = int(number_string)
            samples[-1] = operators.pop()(split_samples[index])
            number_string = ''
        if c in '&:':
            operators.append(samples[-1].intersection)
        elif c == '|':
            operators.append(samples[-1].union)
        elif c == '!':
            last_operator = operators.pop()
            operators.append(lambda x: last_operator(all_sample_set-x))
        elif c == '(':
            samples.append(None)
            operators.append(lambda x: x)
        elif c == ')':
            samples[-1] = operators.pop()(samples.pop())
    if number_string:
        index = int(number_string)
        samples[-1] = operators.pop()(split_samples[index])
    return samples.pop()


def get_all_sample_metadata(dataset_id, sample_fields):
    streaming_body = s3.get_object(ARTIFACT_BUCKET,
                                   f'{dataset_id}/{SAMPLE_METADATA_SUFFIX}')
    all_metadata = json.load(streaming_body)
    # TODO: Allow sample_fields filtering by refactoring the input payload
    return all_metadata


def get_frequency(samples, total_samples):
    raw_frequency = samples / total_samples
    decimal_places = math.ceil(math.log10(total_samples)) - 2
    rounded = round(100 * raw_frequency, decimal_places)
    if decimal_places <= 0:
        rounded = int(rounded)
    return rounded


def get_fuzzy_combinations(all_splits, query_combination,
                           all_sample_metadata_samples):
    print("Starting sample set operations")
    split_samples = [
        set(all_splits[i]['hit_samples'])
        for i in range(len(all_splits))
    ]
    all_sample_set = set(all_sample_metadata_samples)
    if query_combination is None:
        query_combination = '&'.join(str(n) for n in range(len(all_splits)))
    all_part_samples = {
        part: combine_queries(split_samples, part, all_sample_set)
        for part in get_combination_parts(query_combination)
    }
    # we sort the sets because running set.intersection can be thousands of
    # times faster on sorted sets.
    all_part_samples = {
        part: samples
        for part, samples in sorted(all_part_samples.items(), key=lambda x: len(x[1]))
    }
    combination_samples = set.intersection(*all_part_samples.values())
    num_samples = len(combination_samples)
    print(f"Finished main sample set analysis, found {num_samples} samples in common.")
    subcombinations = {}
    # Remove empty parts
    part_samples = {
        part: samples
        for part, samples in all_part_samples.items()
        if samples
    }
    print(f"Removed {len(all_part_samples) - len(part_samples)} empty queries")

    min_parts = {
        part: samples
        for part, samples in part_samples.items()
        if not any(
            (other_samples < samples) or (other_samples == samples and other_part < part)
            for other_part, other_samples in part_samples.items()
        )
    }
    num_samples_from_min_parts = (
        len(set.intersection(*min_parts.values()))
        if min_parts
        else 0
    )
    if num_samples_from_min_parts:
        subcombinations[tuple(min_parts.keys())] = num_samples_from_min_parts
    print(f"Finished minimum sample set analysis, removed {len(part_samples) - len(min_parts)}"
          f" extraneous parts and found {num_samples_from_min_parts} samples in common.")

    subcombinations_checked = 0
    subcombinations_tested = 0
    subcombinations_returned = 0
    part_list = list(part_samples.keys())
    parts_completed = list()
    parts_removed = 1
    num_parts = len(part_list)
    print(f"Checking subcombinations with {num_parts} different parts")
    while (subcombinations_checked < MAX_SUBCOMBINATIONS_TO_CHECK
           and subcombinations_returned < MAX_SUBCOMBINATIONS_TO_RETURN
           and parts_removed < num_parts
           and parts_removed <= MAX_SUBCOMBINATIONS_DEPTH
           ):
        print(f"Testing reducing number of queries by {parts_removed}")
        old_subcombinations_tested = subcombinations_tested
        for subcombination in combinations(part_list, num_parts - parts_removed):
            subcombinations_checked += 1
            part_set = set(subcombination)
            if any(
                    part_set <= other_part_set
                    for other_part_set in parts_completed
            ):
                continue
            # TODO: Calculate which sets to check instead of brute-forcing it
            # There should be a better way of ensuring we only check sets of
            # parts that are not subsets of existing completed part sets. The
            # above code is a brute-force approach that does not allow
            # substantial search depth. It takes around 7 seconds for a
            # combination with 21 parts, the vast majority of which is spent in
            # the above code.
            subcombination_num_samples = len(set.intersection(*(
                part_samples[part]
                for part in subcombination
            )))
            subcombinations_tested += 1
            if subcombination_num_samples > num_samples:
                subcombinations_returned += 1
                subcombinations[subcombination] = subcombination_num_samples
                parts_completed.append(part_set)
        if subcombinations_tested == old_subcombinations_tested:
            print("No more valid combinations to check.")
        parts_removed += 1
    print(f"Checked {subcombinations_checked} subcombinations,"
          f" ran sample set operations on {subcombinations_tested} subcombinations,"
          f" found {subcombinations_returned} improved combinations")
    return (
        list(combination_samples),
        [
            {
                'query_combination': '&'.join(subcombination),
                'removed_combination': '&'.join(
                    part for part in all_part_samples.keys()
                    if part not in subcombination
                ),
                'sample_count': sample_count,
            }
            for subcombination, sample_count in subcombinations.items()
        ]
    )


def get_results(responses):
    all_splits = {}
    all_annotations = {}
    for response in responses.collect_responses():
        result = response.result
        function_name = response.function_name
        if result is None:
            print(f"No result from call to {function_name}")
            raise Exception(repr(response.error))
        if function_name == GET_ANNOTATIONS:
            all_annotations = result
        else:
            assert function_name == SPLIT_QUERY, "Unknown function name"
            all_splits[response.call_id] = response.result
    return all_splits, all_annotations


def get_sample_metadata_counts(samples, all_sample_metadata):
    print("Counting samples for each field")
    details = all_sample_metadata['samples']
    sample_metadata = [
        details[sample]
        for sample in samples
    ]
    field_indexes = all_sample_metadata['field_indexes']
    counts = all_sample_metadata['counts']
    ids = 'ID' in counts
    if ids:
        del counts['ID']
    for field_name, sample_field_counts in counts.items():
        indexes = field_indexes[field_name]
        field_counts = Counter(
            tuple(
                sample[sub_field_i]
                for sub_field_i in indexes
            )
            for sample in sample_metadata
        )
        for field_vals, field_count in field_counts.items():
            last_dict = sample_field_counts
            for this_field in field_vals[:-1]:
                last_dict = last_dict[this_field]
            last_dict[field_vals[-1]][0] = field_count
    if ids:
        id_index = field_indexes['ID'][0]
        counts['ID'] = [
            sample[id_index]
            for sample in sample_metadata
        ]
    return counts


def get_combination_parts(query_combination):
    parts = []
    # Just get top level elements that are separated by AND
    last_part = ''
    depth = 0
    for c in query_combination:
        if c in ':&' and depth == 0:
            parts.append(last_part)
            last_part = ''
        else:
            last_part += c
            if c == '(':
                depth += 1
            elif c == ')':
                depth -= 1
    parts.append(last_part)
    return parts


def get_variants(all_splits):
    variants = {}
    for split in all_splits:
        variants.update(split['variant_samplenum'])
    return variants


def process_page(variants, page_details):
    num_variants = len(variants)
    sortby = page_details['sortby']
    desc = page_details['desc']
    page_size = page_details['page_size']
    if page_size is None:
        page_size = num_variants
    page = page_details['page']
    print(f"Sorting by {sortby}, {'descending' if desc else 'ascending'}")
    variants.sort(key=itemgetter(sortby), reverse=desc)
    skip = (page-1) * page_size
    final_index = page * page_size
    print(f"Restricting {num_variants} annotations to the range"
          f" [{skip}:{final_index}]")
    pages = math.ceil(num_variants / page_size) if page_size else 1
    variants_subset = variants[skip:final_index]
    return pages, variants_subset


def lambda_handler(event, context):
    print('Event Received: {}'.format(json.dumps(event)))
    dataset = event['dataset']
    query_details_list = event['query_details_list']
    query_combination = event['query_combination']
    page_details = event['page_details']
    sample_fields = event['sample_fields']
    include_datasets = event['include_datasets']
    IUPAC = event['IUPAC']
    raw_response = collate_query(
        dataset=dataset,
        query_details_list=query_details_list,
        query_combination=query_combination,
        page_details=page_details,
        sample_fields=sample_fields,
        include_datasets=include_datasets,
        IUPAC=IUPAC,
    )
    response = cache_response(event, raw_response, dynamodb, s3)
    print('Returning response: {}'.format(json.dumps(response)))
    return response

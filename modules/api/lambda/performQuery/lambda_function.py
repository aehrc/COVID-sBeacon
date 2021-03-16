from collections import Counter, defaultdict
import json
import math
import os
import re
import subprocess

from aws_utils import DynamodbClient, LambdaClient, S3Client
from cache_utils import Caches, cache_response

os.environ['PATH'] += ':' + os.environ['LAMBDA_TASK_ROOT']
IUPAC_AMBIGUITY_CODES = {
    'A': {
        'A',
    },
    'C': {
        'C',
    },
    'G': {
        'G',
    },
    'T': {
        'T',
    },
    'U': {
        'T',
    },
    'M': {
        'A',
        'C',
    },
    'R': {
        'A',
        'G',
    },
    'W': {
        'A',
        'T'
    },
    'S': {
        'C',
        'G',
    },
    'Y': {
        'C',
        'T',
    },
    'K': {
        'T',
        'G',
    },
    'V': {
        'A',
        'C',
        'G',
    },
    'H': {
        'A',
        'C',
        'T',
    },
    'D': {
        'T',
        'A',
        'G',
    },
    'B': {
        'T',
        'C',
        'G',
    },
    'N': {
        'T',
        'A',
        'C',
        'G',
    },
}

IUPAC_MATCHES = {
    code1: {
        code2 for code2, bases2 in IUPAC_AMBIGUITY_CODES.items()
        if bases1 & bases2
    } for code1, bases1 in IUPAC_AMBIGUITY_CODES.items()
}

MAX_SPLIT_SIZE = int(os.environ['MAX_SPLIT_SIZE'])
RECURSION_FACTOR = int(os.environ['RECURSION_FACTOR'])

all_count_pattern = re.compile('[0-9]+')
get_all_calls = all_count_pattern.findall
regular_alt = re.compile(f'[{"".join(IUPAC_AMBIGUITY_CODES.keys())}]+')

dynamodb = DynamodbClient()
aws_lambda = LambdaClient()
s3 = S3Client()


class VariantGenotypes:
    def __init__(self):
        self.genotype_to_alt_indexes = {}
        self.alt_pattern = re.compile('\\b([1-9][0-9]*)\\b')

    def alt_indexes(self, genotype):
        try:
            return self.genotype_to_alt_indexes[genotype]
        except KeyError:
            alt_strings = self.alt_pattern.findall(genotype)
            alt_indexes = {int(i)-1 for i in alt_strings}
            self.genotype_to_alt_indexes[genotype] = alt_indexes
            return alt_indexes


variant_genotypes = VariantGenotypes()


def call_perform_query(full_region_start, full_region_end, full_start_min,
                       full_vcf_locations, base_query, responses, this_name):
    if (base_query['end_min'] > base_query['end_max']
            or max(full_region_start, full_start_min) > full_region_end):
        # Region search will find nothing, don't bother.
        return
    subquery_iterator = get_subquery_iterator(
        full_region_start,
        full_region_end,
        full_start_min,
        full_vcf_locations
    )
    for region_start, region_end, start_min, vcf_locations in subquery_iterator:
        vcf_i_range = str(vcf_locations[0][0])
        if len(vcf_locations) > 1:
            vcf_i_range += f'-{vcf_locations[-1][0]}'
        responses.put(
            function_name=this_name,
            function_kwargs={
                'region_start': region_start,
                'region_end': region_end,
                'start_min': start_min,
                'vcf_locations': vcf_locations,
                **base_query,
            },
            call_id=(
                vcf_i_range,
                f'{region_start}-{region_end}',
            ),
        )


def truncate_ref_alt(ref, alt):
    if regular_alt.fullmatch(alt):
        # Just a sequence of IUPAC characters
        suffix_len = 0
        max_suffix = 1 - min(len(ref), len(alt))
        while (suffix_len > max_suffix
               and ref[suffix_len-1] == alt[suffix_len-1]):
            suffix_len -= 1
        if suffix_len:
            return ref[:suffix_len], alt[:suffix_len]
    return ref, alt


def get_possible_codes(code, iupac=True):
    if not iupac:
        return {code}
    possible_codes = {''}
    if code is not None:
        for base in code:
            next_possible_codes = set()
            for possible_code in possible_codes:
                for iupac_code in IUPAC_MATCHES[base]:
                    next_possible_codes.add(possible_code + iupac_code)
            possible_codes = next_possible_codes
    return possible_codes


def get_subquery_iterator(region_start, region_end, start_min, vcf_locations):
    region_length = region_end - region_start + 1
    num_subregions = math.ceil(region_length / MAX_SPLIT_SIZE)
    print(f"Number of subregions: {num_subregions}")
    num_vcfs = len(vcf_locations)
    print(f"Number of VCFs: {num_vcfs}")
    total_splits = num_subregions * num_vcfs
    recursion_levels = math.log(total_splits, RECURSION_FACTOR)
    # take the fractional part, but 1 if a whole number
    this_level_recursion = (recursion_levels - int(recursion_levels)) or 1
    this_level_splits = max(math.ceil(RECURSION_FACTOR**this_level_recursion), 2)
    num_region_splits = min(num_subregions, this_level_splits)
    print(f"Splitting region into {num_region_splits} part(s)")
    num_vcf_splits = min(num_vcfs, round(this_level_splits/num_region_splits))
    print(f"Splitting VCFs into {num_vcf_splits} part(s)")
    split_region_size = math.ceil(region_length / num_subregions)
    vcfs_per_split = math.ceil(num_vcfs / num_vcf_splits)

    split_start = region_start
    split_start_min = start_min
    while split_start <= region_end:
        split_end = min(split_start + split_region_size, region_end)
        for i in range(num_vcf_splits):
            yield (
                split_start,
                split_end,
                split_start_min,
                vcf_locations[vcfs_per_split*i:vcfs_per_split*(i+1)]
            )
        # Allow valid variants (read: deletions and CNVs) that start before
        # the searched region. Only need the first region split to find these.
        split_start = split_start_min = split_end + 1


def name_variant(pos, ref, alt):
    return f'{ref}{pos}{alt}'


def perform_query(reference_bases, region, start_min, end_min, end_max, alternate_bases,
                  variant_type, vcf_i, vcf_location, IUPAC):
    args = [
        'bcftools', 'query',
        '--regions', region,
        '--format', '%POS\t%REF\t%ALT\t[%GT,]\n',
        vcf_location
    ]
    query_process = subprocess.Popen(args, stdout=subprocess.PIPE, cwd='/tmp',
                                     encoding='ascii')
    v_prefix = '<{}'.format(variant_type)
    approx = reference_bases == 'N' and variant_type
    hit_samples = set()
    variant_samples = defaultdict(set)
    call_count = 0
    iupac = IUPAC == 'True'
    reference_matches = get_possible_codes(reference_bases, iupac)
    alternate_matches = get_possible_codes(alternate_bases, iupac)

    for line in query_process.stdout:
        try:
            position, reference, all_alts, genotypes = line.split('\t')
        except ValueError as e:
            print(repr(line.split('\t')))
            raise e

        pos = int(position)
        if pos < start_min:
            # This variant will either have been found by an earlier search,
            # or the start/startMin parameter precludes it.
            continue

        ref_alts = [
            truncate_ref_alt(reference, alt)
            for alt in all_alts.split(',')
        ]
        hit_indexes = {
            i for i, (ref, _) in enumerate(ref_alts)
            if (end_min <= pos + len(ref) - 1 <= end_max
                and approx or ref.upper() in reference_matches
                )
        }
        if not hit_indexes:
            continue

        if alternate_bases is None:
            if variant_type == 'DEL':
                hit_indexes &= {
                    i for i, (ref, alt) in enumerate(ref_alts)
                    if (i in hit_indexes and (
                        (alt.startswith(v_prefix)
                         or alt == '<CN0>')
                        if alt.startswith('<')
                        else len(alt) < len(ref)))
                }
            elif variant_type == 'INS':
                hit_indexes &= {
                    i for i, (ref, alt) in enumerate(ref_alts)
                    if (alt.startswith(v_prefix)
                        if alt.startswith('<')
                        else len(alt) > len(ref))
                }
            # The calculation of these gets shaky as we don't have the
            # bases before ref, so these will only work in trivial cases
            elif variant_type == 'DUP':
                hit_indexes &= {
                    i for i, (ref, alt) in enumerate(ref_alts)
                    if ((alt.startswith(v_prefix)
                         or (alt.startswith('<CN')
                             and alt not in ('<CN0>', '<CN1>')))
                        if alt.startswith('<')
                        else re.fullmatch('({}){{2,}}'.format(ref),
                                          alt))
                }
            elif variant_type == 'DUP:TANDEM':
                hit_indexes &= {
                    i for i, (ref, alt) in enumerate(ref_alts)
                    if ((alt.startswith(v_prefix)
                         or alt == '<CN2>')
                        if alt.startswith('<')
                        else alt == ref+ref)
                }
            elif variant_type == 'CNV':
                hit_indexes &= {
                    i for i, (ref, alt) in enumerate(ref_alts)
                    if ((alt.startswith(v_prefix)
                         or alt.startswith('<CN')
                         or alt.startswith('<DEL')
                         or alt.startswith('<DUP'))
                        if alt.startswith('<')
                        else re.fullmatch('\\.|({})*'.format(ref),
                                          alt))
                }
            else:
                # For structural variants that aren't otherwise recognisable
                hit_indexes &= {
                    i for i, (_, alt) in enumerate(ref_alts)
                    if alt.startswith(v_prefix)
                }
        else:
            hit_indexes &= {
                i for i, (_, alt) in enumerate(ref_alts)
                if alt.upper() in alternate_matches
            }
        if not hit_indexes:
            continue
        all_calls = get_all_calls(genotypes)
        hit_set = set(str(i+1) for i in hit_indexes)
        call_count += sum(1 for call in all_calls if call in hit_set)
        if call_count:
            genotype_samples = defaultdict(list)
            for i, gt in enumerate(genotypes.split(',')):
                genotype_samples[gt].append(i)
            for genotype, samples in genotype_samples.items():
                all_hits = variant_genotypes.alt_indexes(genotype)
                for hit in all_hits & hit_indexes:
                    hit_samples.update(samples)
                    name = name_variant(position, *ref_alts[hit])
                    variant_samples[name].update(samples)

    query_process.stdout.close()
    return {
        'call_count': call_count,
        'variant_samplenum': {
            variant: len(samples)
            for variant, samples in variant_samples.items()
        },
        'hit_samples': [
            f'{vcf_i}:{sample_i}'
            for sample_i in hit_samples
        ],
    }


def read_query_results(responses):
    call_count = 0
    variant_samplenum = Counter()
    hit_samples = set()
    for query in responses.collect_responses():
        vcf_i, _ = query.call_id
        query_result = query.result
        call_count += query_result['call_count']
        variant_samplenum.update(query_result['variant_samplenum'])
        hit_samples.update(query_result['hit_samples'])
    return call_count, variant_samplenum, list(hit_samples)


def split_query(region_start, region_end, start_min, vcf_locations, base_query, this_name):
    responses = Caches(
        dynamodb_client=dynamodb,
        lambda_client=aws_lambda,
        s3_client=s3,
    )
    call_perform_query(region_start, region_end, start_min, vcf_locations, base_query, responses, this_name)
    call_count, variant_samplenum, hit_samples = read_query_results(responses)
    return {
        'call_count': call_count,
        'variant_samplenum': variant_samplenum,
        'hit_samples': hit_samples,
    }


def lambda_handler(event, context):
    print('Event Received: {}'.format(json.dumps(event)))
    region_start = event['region_start']
    region_end = event['region_end']
    start_min = event['start_min']
    vcf_locations = event['vcf_locations']
    base_query = {
        'reference_bases': event['reference_bases'],
        'end_min': event['end_min'],
        'end_max': event['end_max'],
        'alternate_bases': event['alternate_bases'],
        'variant_type': event['variant_type'],
        'IUPAC': event['IUPAC'],
    }
    if len(vcf_locations) == 1 and region_end - region_start + 1 <= MAX_SPLIT_SIZE:
        vcf_i, vcf_location, contig = vcf_locations[0]
        raw_response = perform_query(
            region=f'{contig}:{region_start}-{region_end}',
            start_min=start_min,
            vcf_i=vcf_i,
            vcf_location=vcf_location,
            **base_query,
        )
    else:
        raw_response = split_query(region_start, region_end, start_min, vcf_locations, base_query,
                                   context.function_name)

    response = cache_response(event, raw_response, dynamodb, s3)
    print('Returning response: {}'.format(json.dumps(response)))
    return response

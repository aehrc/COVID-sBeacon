from collections import defaultdict
import json
import os
import re
import subprocess

from aws_utils import DynamodbClient, S3Client
from cache_utils import cache_response

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

all_count_pattern = re.compile('[0-9]+')
get_all_calls = all_count_pattern.findall
regular_alt = re.compile(f'[{"".join(IUPAC_AMBIGUITY_CODES.keys())}]+')

dynamodb = DynamodbClient()
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


def get_possible_codes(code):
    possible_codes = {''}
    if code is not None:
        for base in code:
            next_possible_codes = set()
            for possible_code in possible_codes:
                for iupac_code in IUPAC_MATCHES[base]:
                    next_possible_codes.add(possible_code + iupac_code)
            possible_codes = next_possible_codes
    return possible_codes


def name_variant(pos, ref, alt):
    return f'{ref}{pos}{alt}'


def perform_query(reference_bases, region, end_min, end_max, alternate_bases,
                  variant_type, vcf_location):
    args = [
        'bcftools', 'query',
        '--regions', region,
        '--format', '%POS\t%REF\t%ALT\t[%GT,]\n',
        vcf_location
    ]
    query_process = subprocess.Popen(args, stdout=subprocess.PIPE, cwd='/tmp',
                                     encoding='ascii')
    v_prefix = '<{}'.format(variant_type)
    first_bp = int(region[region.find(':')+1: region.find('-')])
    last_bp = int(region[region.find('-')+1:])
    approx = reference_bases == 'N' and variant_type
    variant_samples = defaultdict(list)
    call_count = 0
    reference_matches = get_possible_codes(reference_bases)
    alternate_matches = get_possible_codes(alternate_bases)
    for line in query_process.stdout:
        try:
            position, reference, all_alts, genotypes = line.split('\t')
        except ValueError as e:
            print(repr(line.split('\t')))
            raise e

        pos = int(position)
        # Ensure each variant will only be found by one process
        if not first_bp <= pos <= last_bp:
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
                    name = name_variant(position, *ref_alts[hit])
                    variant_samples[name] += samples
    query_process.stdout.close()
    return {
        'variant_samples': variant_samples,
        'call_count': call_count,
    }


def lambda_handler(event, context):
    print('Event Received: {}'.format(json.dumps(event)))
    reference_bases = event['reference_bases']
    region = event['region']
    end_min = event['end_min']
    end_max = event['end_max']
    alternate_bases = event['alternate_bases']
    variant_type = event['variant_type']
    vcf_location = event['vcf_location']
    raw_response = perform_query(reference_bases, region, end_min, end_max,
                                 alternate_bases, variant_type, vcf_location)
    response = cache_response(event, raw_response, dynamodb, s3)
    print('Returning response: {}'.format(json.dumps(response)))
    return response

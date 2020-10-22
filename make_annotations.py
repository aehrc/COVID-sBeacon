#!/usr/bin/env python3
from collections import Counter, defaultdict
import csv
import glob
import sys

KEY_FIELD = 'Variant'

IGNORED_COLUMNS = {
    'Chr',
    'Start',
    'Ref',
    'Alt',
    'End',
}


def incorporate_file(variants_dict, fieldnames, file_path):
    fieldnames_set = set(fieldnames)
    with open(file_path, 'r', newline='') as f:
        reader = csv.DictReader(f, delimiter='\t')
        for row in reader:
            variant = f"{row['Start'].strip()}{row['Ref'].strip()}>{row['Alt'].strip()}"
            if variant not in variants_dict:
                variants_dict[variant] = defaultdict(
                    Counter,
                    {
                        KEY_FIELD: Counter([variant])
                    }
                )
            variant_metadata = variants_dict[variant]
            for key, val in row.items():
                if key not in IGNORED_COLUMNS and val not in {'.', ''}:
                    variant_metadata[key].update([val])
                    if key not in fieldnames_set:
                        fieldnames_set.add(key)
                        fieldnames.append(key)


if __name__ == '__main__':
    variants = {}
    fields = [KEY_FIELD]
    for filepath in sys.argv[1:]:
        # get all .vcf and .txt annotation files
        for file_name in (glob.glob(filepath + '/*.vcf')
                          + glob.glob(filepath + '/*.txt')):
            incorporate_file(variants, fields, file_name)
    writer = csv.DictWriter(sys.stdout, fields, delimiter='\t', restval='.')
    writer.writeheader()
    writer.writerows(
        {
            key: val_counts.most_common(1)[0][0]  # Pick most populous value
            for key, val_counts in details.items()
        } for details in variants.values())

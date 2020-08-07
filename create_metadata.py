#!/usr/bin/env python3
import csv
import sys


def get_metadata(metadata_file_path):
    with open(metadata_file_path, newline='') as csv_file:
        reader = csv.DictReader(csv_file)
        all_rows = tuple(
            {
                header.replace(' ', ''): value
                for header, value in row.items()
            }
            for row in reader
        )
        metadata_dict = {
            row['AccessionID']: row
            for row in all_rows
        }
    for row in all_rows:
        for alternate in row['RelatedID'].split(','):
            metadata_dict[alternate.strip()] = row
    for acc_id in metadata_dict.keys():
        if '.' in acc_id:
            print(acc_id)
    return metadata_dict


def run(metadata_file_path, output_path, samples):
    metadata = get_metadata(metadata_file_path)
    out_rows = []
    for sample in samples:
        try:
            val = metadata[sample.split('.')[0]]
        except KeyError:
            print(f"Could not find metadata for {sample}")
            val = {}
        out_rows.append(val)
    with open(output_path, 'w', newline='') as metadata_csv:
        writer = csv.DictWriter(metadata_csv, fieldnames=out_rows[0].keys())
        writer.writeheader()
        writer.writerows(out_rows)


if __name__ == '__main__':
    metadata_file, output_file = sys.argv[1:3]
    run(metadata_file, output_file, (s.strip() for s in sys.stdin))

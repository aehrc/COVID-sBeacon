#!/usr/bin/env python3
import csv
import ftplib
import re
import sys

import requests


GFF3_FTP_HOST = 'download.big.ac.cn'
GFF3_FTP_DIRECTORY = 'GVM/Coronavirus/gff3'
GFF3_FILE_TEMPLATE = '2019-nCoV_{}_variants.gff3'

anchor_prefix = (
    f'<a href="ftp://{GFF3_FTP_HOST}/{GFF3_FTP_DIRECTORY}/'.encode())
len_anchor_prefix = len(anchor_prefix)

REFERENCE_IDS = {
    'MN908947',
    'NC_045512',
    'EPI_ISL_402125',
}


WEBPAGE_TEMPLATE = 'https://bigd.big.ac.cn/ncov/genome/accession?q={}'

VCF_HEADER_LINES = (
    '##fileformat=VCFv4.1\n',
    '##contig=<ID=1,length=29903>\n',
    '##FORMAT=<ID=GT,Number=1,Type=String,Description="Genotype">\n',
    '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\t',
)

valid_alt = re.compile('[ACGTUMRWSYKVHDBN]+')


def convert_to_vcf(gff_file, accession_id, sequence, output_file_name, ftp):
    lines = list(VCF_HEADER_LINES)
    lines[-1] += accession_id + '\n'
    if not gff_file:
        print("\tIs reference, producing empty VCF")
    else:
        ftp_command = 'RETR ' + gff_file
        print('\t' + ftp_command)

        def update_local_vcf(line):
            update_vcf(sequence, lines, line)

        ftp.retrlines(ftp_command, update_local_vcf)

    with open(output_file_name, 'w') as vcf_file:
        vcf_file.writelines(lines)


def find_gff_file(gff_files, accession_id, related_ids):
    ids = [accession_id] + [rel.strip() for rel in related_ids.split(',')]
    for genome_id in ids:
        if genome_id in REFERENCE_IDS:
            # equal to reference, therefore no variants
            return False
        prospective_file = GFF3_FILE_TEMPLATE.format(genome_id)
        if prospective_file in gff_files:
            return prospective_file
    return get_gff_from_web(accession_id)


def get_valid_rows(metadata_file_path, start_accession=None):
    with open(metadata_file_path, newline='') as csv_file:
        reader = csv.DictReader(csv_file)
        skipping = start_accession
        for row in reader:
            if skipping:
                if row['Accession ID'] == start_accession:
                    skipping = False
                else:
                    continue
            if validate_metadata_line(row):
                yield row


def get_fasta_sequence(fasta_file_iterable):
    sequence_lines = {}
    sequence_name = ''
    for line in fasta_file_iterable:
        if line.startswith('>'):
            sequence_name = line[1:line.find(' ')].rstrip('\r\n')
            sequence_lines[sequence_name] = []
        else:
            sequence_lines[sequence_name].append(line.rstrip('\r\n'))
    return {
        sequence: ''.join(lines)
        for sequence, lines in sequence_lines.items()
    }


def get_gff_from_web(accession_id):
    web_url = WEBPAGE_TEMPLATE.format(accession_id)
    print(f"\tLooking up file on {web_url}")
    response = requests.get(web_url)
    assert response.status_code == 200
    content = response.content
    try:
        anchor_index = content.index(anchor_prefix)
    except ValueError:
        assert content.find(b'gff3') == -1
        return None
    gff_start = anchor_index + len_anchor_prefix
    gff_end = content.index(b'"', gff_start)
    return content[gff_start:gff_end].decode()


def get_ftp_connection():
    ftp = ftplib.FTP(host=GFF3_FTP_HOST, user='anonymous')
    ftp.cwd(GFF3_FTP_DIRECTORY)
    return ftp


def get_variant_string(gff3_line, sequence):
    if gff3_line.startswith('#'):
        return None
    _, _, _, start_str, end_str, _, _, _, info = gff3_line.split('\t')
    start = int(start_str)
    end = int(end_str)
    _, _, ref_str, alt_str, _ = info.split(';')
    assert ref_str.startswith('REF=')
    ref = ref_str[4:]
    assert alt_str.startswith('ALT=')
    alt = alt_str[4:]
    if sequence[start-1:end] != ref:
        print(f"\tLine does not match reference sequence "
              f"'{sequence[start-1:end]}'\n\t{gff3_line}")
        if (start == 1 and ref[1:] == sequence[start-1:end]
                and alt == '-'):
            # Deletes at the start add a base before the sequence
            ref = ref[1:]
            print(f"\tChanging reference to '{ref}'")
        elif ref == '-' and alt.startswith('-') and start == end:
            # Some insertions seem to use '-' as the ref
            # fasta shows Alt should start with 'N'
            ref = sequence[start-1]
            alt = ref + 'N' + alt[1:]
            print(f"\tChanging reference to '{ref}' and alt to '{alt}'")
        else:
            raise Exception("Unhandled reference mismatch")
    if not valid_alt.fullmatch(alt):
        if alt == '-':
            if start > 1:
                start -= 1
                padding_base = sequence[start-1]
                ref = padding_base + ref
                alt = padding_base
            else:
                padding_base = sequence[end]
                ref = ref + padding_base
                alt = padding_base
        else:
            raise Exception(f"Unknown alt in line\n{gff3_line}")
    return '\t'.join([
        '1',
        str(start),
        '.',
        ref,
        alt,
        '.',
        '.',
        '.',
        'GT',
        '1\n',
    ])


def run(fasta_file_path, metadata_file_path, output_directory,
        start):
    with open(fasta_file_path, 'r') as fasta_file_obj:
        sequence = get_fasta_sequence(fasta_file_obj)['1']
    valid_rows = get_valid_rows(metadata_file_path, start)
    ftp = get_ftp_connection()
    gff_files = ftp.nlst()
    sample_metadata = []
    for row in valid_rows:
        accession_id = row['Accession ID']
        print(f"processing {accession_id}")
        gff_file = find_gff_file(gff_files, accession_id, row['Related ID'])
        if gff_file is None:
            print("\tWebsite does not contain link to gff3 file, skipping")
            continue
        output_file = f'{output_directory}/{accession_id}.vcf'
        convert_to_vcf(gff_file, accession_id, sequence, output_file, ftp)
        sample_metadata.append(row)
    ftp.quit()
    sample_metadata.sort(key=lambda x: x['Accession ID'])
    with open(output_directory + '/metadata.csv', 'w', newline='') as metadata_csv:
        writer = csv.DictWriter(metadata_csv, fieldnames=sample_metadata[0].keys())
        writer.writeheader()
        writer.writerows(sample_metadata)


def validate_metadata_line(metadata):
    return (
        metadata['Nuc.Completeness'] == 'Complete'
        and metadata['Sequence Quality'] == 'High'
        and metadata['Host'].lower() == 'homo sapiens'
    )


def update_vcf(sequence, vcf_lines, prospective_line):
    variant = get_variant_string(prospective_line, sequence)
    if variant:
        vcf_lines.append(variant)


if __name__ == '__main__':
    fasta_file, metadata_file, output_dir = sys.argv[1:4]
    start_accession_id = sys.argv[4] if len(sys.argv) > 4 else None
    run(fasta_file, metadata_file, output_dir, start_accession_id)

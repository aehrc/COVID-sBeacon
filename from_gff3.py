#!/usr/bin/env python3
import csv
import ftplib
import pathlib
import re
import sys
import time

import requests


FTP_RETRY_ERRORS = ftplib.all_errors + (AttributeError,)
FTP_CLOSE_AFTER = 30
GFF3_FTP_HOST = 'download.big.ac.cn'
GFF3_FTP_DIRECTORY = 'GVM/Coronavirus/gff3'
GFF3_FTP_TIMEOUT = 10
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


class RetryFTP:
    def __init__(self, *args, **kwargs):
        self.ftp_args = args
        self.ftp_kwargs = kwargs
        self.ftp = None
        self.call_time = None
        self._set_new_ftp()

    def cwd(self, *args, **kwargs):
        try:
            resp = self.ftp.cwd(*args, **kwargs)
        except FTP_RETRY_ERRORS as e:
            log_print(e)
            self._set_new_ftp()
            return self.cwd(*args, **kwargs)
        self._reset_call_time()
        return resp

    def nlst(self, *args, **kwargs):
        try:
            resp = self.ftp.nlst(*args, **kwargs)
        except FTP_RETRY_ERRORS as e:
            log_print(e)
            self._set_new_ftp()
            return self.nlst(*args, **kwargs)
        self._reset_call_time()
        return resp

    def quit(self, *args, **kwargs):
        if self.ftp is None:
            resp = None
        else:
            try:
                resp = self.ftp.quit(*args, **kwargs)
            except ftplib.all_errors + (AttributeError,) as e:
                log_print(e)
                resp = self.ftp.close()
            self.ftp = None
        self._reset_call_time()
        return resp

    def retrlines(self, *args, **kwargs):
        try:
            resp = self.ftp.retrlines(*args, **kwargs)
        except FTP_RETRY_ERRORS as e:
            log_print(e)
            self._set_new_ftp()
            return self.retrlines(*args, **kwargs)
        self._reset_call_time()
        return resp

    def _reset_call_time(self):
        self.call_time = time.time()

    def _set_new_ftp(self):
        if self.ftp is not None:
            log_print("Restarting ftp client...")
            self.quit()
        else:
            log_print("Initialising ftp client...")
        try:
            self.ftp = ftplib.FTP(*self.ftp_args, **self.ftp_kwargs)
            self.ftp.cwd(GFF3_FTP_DIRECTORY)
        except FTP_RETRY_ERRORS as e:
            log_print(e)
            log_print("Waiting 5 minutes before trying again...")
            time.sleep(300)
            self._set_new_ftp()
        self._reset_call_time()


def convert_to_vcf(gff_file, accession_id, sequence, output_file_name, ftp):
    lines = list(VCF_HEADER_LINES)
    lines[-1] += accession_id + '\n'
    if not gff_file:
        print("\tIs reference, producing empty VCF", file=sys.stderr)
    else:
        records = []
        ftp_command = 'RETR ' + gff_file
        print('\t' + ftp_command, file=sys.stderr)

        def update_local_vcf(line):
            update_vcf(sequence, records, line)

        ftp.retrlines(ftp_command, update_local_vcf)
        records.sort(key=lambda r: int(r.split('\t')[1]))
        lines += records
    with open(output_file_name, 'w') as vcf_file:
        vcf_file.writelines(lines)


def find_gff_file(gff_files, accession_id, related_ids):
    ids = [accession_id] + [rel.strip() for rel in related_ids.split(',')]
    for genome_id in ids:
        if genome_id in REFERENCE_IDS:
            # equal to reference, therefore no variants
            return False
        prospective_file = gff_files.get(genome_id)
        if prospective_file:
            return prospective_file
    return get_gff_from_web(accession_id)


def get_valid_rows(metadata_file_path, gisaid, start_accession=None):
    with open(metadata_file_path, newline='') as csv_file:
        reader = csv.DictReader(csv_file)
        skipping = start_accession
        for row in reader:
            if skipping:
                if row['Accession ID'] == start_accession:
                    skipping = False
                else:
                    continue
            if validate_metadata_line(row, gisaid):
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
    print(f"\tLooking up file on {web_url}", file=sys.stderr)
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
              f"'{sequence[start-1:end]}'\n\t{gff3_line}", file=sys.stderr)
        if (start == 1 and ref[1:] == sequence[start-1:end]
                and alt == '-'):
            # Deletes at the start add a base before the sequence
            ref = ref[1:]
            print(f"\tChanging reference to '{ref}'", file=sys.stderr)
        elif ref == '-' and alt.startswith('-') and start == end:
            # Some insertions seem to use '-' as the ref
            # fasta shows Alt should start with 'N'
            ref = sequence[start-1]
            alt = ref + 'N' + alt[1:]
            print(f"\tChanging reference to '{ref}' and alt to '{alt}'",
                  file=sys.stderr)
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
        elif alt == 'X':
            # Probably not able to be aligned, ignore
            return None
        else:
            raise Exception(f"Unknown alt {alt} in line\n{gff3_line}")
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


def get_locations(ftp):
    accessions = {}
    suffix = '_variants.gff3'
    len_suffix = len(suffix)
    top_level = ftp.nlst()
    for folder in top_level:
        if len(folder) != 1:
            continue
        this_level = ftp.nlst(folder)
        if not this_level:
            break
        prefix = f'{folder}/2019-nCoV_'
        len_prefix = len(prefix)
        new_accessions = {
            file_path[len_prefix:-len_suffix]: file_path
            for file_path in this_level
            if file_path.startswith(prefix) and file_path.endswith(suffix)
        }
        assert new_accessions  # Make sure there were some hits in this folder
        accessions.update(new_accessions)
    else:
        raise Exception("They've used up all the single letter folders,"
                        " now what?")
    assert accessions  # Make sure the format hasn't changed
    return accessions


def run(fasta_file_path, metadata_file_path, output_directory,
        gisaid, start):
    with open(fasta_file_path, 'r') as fasta_file_obj:
        sequence = get_fasta_sequence(fasta_file_obj)['1']
    valid_rows = get_valid_rows(metadata_file_path, gisaid, start)
    ftp = RetryFTP(host=GFF3_FTP_HOST, user='anonymous',
                   timeout=GFF3_FTP_TIMEOUT)
    gff_files = get_locations(ftp)
    for row in valid_rows:
        if time.time() - ftp.call_time > FTP_CLOSE_AFTER:
            ftp.quit()
        accession_id = row['Accession ID']
        output_file = f'{output_directory}/{accession_id}.vcf'
        print(f"processing {accession_id}", file=sys.stderr)
        vcf_path = pathlib.Path(output_file)
        try:
            # Check if file already exists and is not corrupt
            vcf_characters = vcf_path.read_text()
        except FileNotFoundError:
            pass
        else:
            if (vcf_characters.endswith('\t.\t.\tGT\t1\n')
                    or vcf_characters.endswith(
                        f'FORMAT\t{accession_id}\n')):
                print(f"File {output_file} is already complete.", file=sys.stderr)
                print(output_file, file=sys.stdout)
                continue
            else:
                print(f"File {output_file} exists but appears to be"
                      " corrupted.", file=sys.stderr)
        print(f"Searching for gff3 file for {accession_id}", file=sys.stderr)
        gff_file = find_gff_file(gff_files, accession_id, row['Related ID'])
        if gff_file is None:
            print("\tWebsite does not contain link to gff3 file, skipping", file=sys.stderr)
            continue
        convert_to_vcf(gff_file, accession_id, sequence, output_file, ftp)
        print(output_file, file=sys.stdout)
    ftp.quit()


def validate_metadata_line(metadata, gisaid=False):
    return (
        metadata['Nuc.Completeness'] == 'Complete'
        and metadata['Sequence Quality'] == 'High'
        and metadata['Host'].lower() == 'homo sapiens'
        and (metadata['Data Source'] == 'GISAID') == gisaid
    )


def update_vcf(sequence, vcf_lines, prospective_line):
    variant = get_variant_string(prospective_line, sequence)
    if variant:
        vcf_lines.append(variant)


if __name__ == '__main__':
    (
        fasta_file,
        metadata_file,
        output_dir,
        gisaid_str,
    ) = sys.argv[1:6]
    start_accession_id = sys.argv[6] if len(sys.argv) > 6 else None
    run(fasta_file, metadata_file, output_dir, bool(int(gisaid_str)),
        start_accession_id)

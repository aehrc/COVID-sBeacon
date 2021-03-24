#!/usr/bin/env python3
from collections import deque
import sys


class VcfRecordDetails:
    def __init__(self, record, samples=None, pos_1=False):
        self.deletion_alts = []
        self.open_deletions = set()
        self.p1_deletion_alts = []
        self.p1_open_deletions = set()
        self.has_deletions = False
        self.add_deletions(samples, pos_1)
        self.pos = int(record[1])
        # Remove unnecessary fields
        record[2] = record[5] = record[6] = record[7] = '.'
        self.record = record
        alts = record[4]
        self.num_native_alts = alts.count(',') + 1 if alts else 0

    def add_deletions(self, samples, pos_1=False):
        if samples:
            self.has_deletions = True
            if pos_1:
                self.p1_open_deletions = samples
            else:
                self.open_deletions = samples

    def is_complete(self):
        return not (self.open_deletions or self.p1_open_deletions)

    def update(self, last_pos, deletion_samples):
        if self.pos == 1:
            # Run through deletions that start at position 1 first
            self._update(last_pos, deletion_samples, True)
        self._update(last_pos, deletion_samples)

    def write(self, sequence):
        seq_start = self.pos-1
        record = self.record
        assert sequence[seq_start:].startswith(record[3])
        if self.has_deletions:
            ref_len = max(self.p1_deletion_alts + self.deletion_alts) + 1
            seq_end = seq_start + ref_len
            record[3] = sequence[seq_start:seq_end]
            seq_start_char = sequence[seq_start]
            alts = [
                alt + sequence[seq_start+len(alt):seq_end]
                for alt in record[4].split(',')
                if alt
            ] + [
                sequence[seq_start+del_size:seq_end]
                for del_size in self.p1_deletion_alts
            ] + [
                seq_start_char + sequence[seq_start+del_size+1:seq_end]
                for del_size in self.deletion_alts
            ]
            record[4] = ','.join(alts)
        print('\t'.join(record), file=sys.stdout)

    def _update(self, last_pos, deletion_samples, pos_1=False):
        if pos_1:
            deletion_alts = self.p1_deletion_alts
            open_deletions = self.p1_open_deletions
        else:
            deletion_alts = self.deletion_alts
            open_deletions = self.open_deletions
        dropped_deletions = open_deletions - deletion_samples
        # Remove deletions from set to check
        deletion_samples -= open_deletions
        if dropped_deletions:
            open_deletions -= dropped_deletions
            num_alts = (
                    self.num_native_alts
                    + len(self.deletion_alts)
                    + len(self.p1_deletion_alts)
            )
            alt_gt = str(num_alts+1)
            record = self.record
            record[9:] = [
                alt_gt if i in dropped_deletions else g
                for i, g in enumerate(record[9:])
            ]
            # record deletion size for this alt
            deletion_alts.append(
                (last_pos - self.pos)
                if not pos_1
                else (last_pos - self.pos + 1)
            )


def convert(fasta_file_path):
    with open(fasta_file_path, 'r') as fasta_file_obj:
        sequence = get_fasta_sequence(fasta_file_obj)['1']
    open_records = deque()
    last_position = 0
    num_samples = 0
    for record_string in sys.stdin:
        if record_string.startswith('#'):
            print(record_string, file=sys.stdout, end='')
            if record_string.startswith('#CHROM'):
                num_samples = record_string.count('\t') - 8
        else:
            last_position = process_line(open_records, record_string, num_samples, last_position)
            write_records(open_records, sequence)
    update_records(open_records, last_position, set())
    write_records(open_records, sequence)


def create_new_record(pos, deletion_samples, num_samples):
    record_info = [
        '1',  # CHROM
        str(pos),  # POS
        '.',  # ID
        '',  # REF - to be filled just before printing
        '',  # ALT - to be filled just before printing
        '.',  # QUAL
        '.',  # FILTER
        '.',  # INFO
        'GT',  # FORMAT
    ] + [
        '1' if i in deletion_samples else '0'
        for i in range(num_samples)
    ]
    return VcfRecordDetails(record_info, samples=deletion_samples)


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


def process_line(open_records, line, num_samples, last_position):
    # CHROM POS ID REF ALT QUAL FILTER INFO FORMAT SAMPLE1 SAMPLE2 ...
    record = line.rstrip().split(sep='\t')
    assert record[8] == 'GT', "Script expects only the GT format field"
    # Ensure records are in order and only one record per position
    assert len(record[3]) == 1, "Script expects only single-nucleotide reference"
    new_position = int(record[1])
    assert new_position > last_position, "Script expects sorted VCF and only one record per position"
    # Change inline deletions to ref and collect sample indexes
    deletion_samples = remove_alt(record, '*', '0')
    update_records(open_records, last_position, deletion_samples)
    if deletion_samples and new_position != 1:
        if open_records and open_records[-1].pos == new_position - 1:
            open_records[-1].add_deletions(deletion_samples)
        else:
            # Make an intermediate record to hold the new deletions
            new_record = create_new_record(new_position - 1, deletion_samples,
                                           num_samples)
            open_records.append(new_record)

    if new_position == 1:
        open_records.append(VcfRecordDetails(record, samples=deletion_samples,
                                             pos_1=True))
    elif record[4]:
        open_records.append(VcfRecordDetails(record))
        # i.e. skip records that only show an upstream deletion.
    return new_position


def remove_alt(record, alt_to_remove, gt_replacement):
    alts = record[4]
    if alt_to_remove in alts:
        split_alts = alts.split(',')
        alt_index = split_alts.index(alt_to_remove) + 1
        # Get samples with alt
        alt_index_string = str(alt_index)
        alt_samples = {
            i
            for i, genotype in enumerate(record[9:])
            if genotype == alt_index_string
        }
        # Set alt to replacement and shift up later alts
        new_genotypes = {
            str(g): gt_replacement if g == alt_index else str(g - 1)
            for g in range(alt_index, len(split_alts) + 1)
        }
        record[9:] = [
            new_genotypes.get(g, g)
            for g in record[9:]
        ]
        # Remove alt from ALTS column
        record[4] = ','.join(
            split_alts[:alt_index - 1]
            + split_alts[alt_index:]
        )
    else:
        alt_samples = set()
    return alt_samples


def update_records(open_records, last_position, deletion_samples):
    for open_record in open_records:
        open_record.update(last_position, deletion_samples)


def write_records(open_records, sequence):
    while True:
        if not open_records:
            break
        first_record = open_records[0]
        if first_record.is_complete():
            first_record.write(sequence)
            open_records.popleft()
        else:
            break


if __name__ == '__main__':
    (
        fasta_file,
    ) = sys.argv[1:2]
    convert(fasta_file)

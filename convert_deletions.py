from collections import deque
import sys


# Used for handling deletions differently that start at pos 1
POS_1_PREFIX = 'pos_1_'


class RecordDetails:
    def __init__(self, record):
        self.record = record
        self.p1_open_deletions = set()
        self.p1_deletion_alts = []
        self.open_deletions = set()
        self.deletion_alts = []
        self.pos = int(record[1])


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
            continue
        # CHROM POS ID REF ALT QUAL FILTER INFO FORMAT SAMPLE1 SAMPLE2 ...
        record = record_string.split(sep='\t')
        assert record[8] == 'GT', "Script expects only the GT format field"
        # Ensure records are in order and only one record per position
        new_position = int(record[1])
        assert new_position > last_position, "Script expects sorted VCF and only one record per position"
        last_position = new_position
        alts = record[4]
        if '*' in alts:
            split_alts = alts.split(',')
            deletion_index = split_alts.index('*') + 1
            # Get samples with deletion (note index offset)
            deletion_index_string = str(deletion_index)
            deletion_samples = {
                i
                for i, genotype in enumerate(record[9:])
                if genotype == deletion_index_string
            }
            if not open_records:
                if new_position != 1:
                    # Make an intermediate record to hold the new deletions
                    new_record = create_new_record(sequence, new_position-1,
                                                   deletion_samples, num_samples)
                    open_records.append(new_record)


            last_open_record - open_records[-1]
            if new_position == 1:
                # put deletion in this record
                open_records[-1]['open_deletions'] = deletion_samples
            else:
                deletion_record = open_records[-2]
            # Set deletions to ref and shift up later alts
            new_genotypes = {
                str(g): '0' if g == deletion_index else str(g-1)
                for g in range(deletion_index, len(split_alts)+1)
            }
            record[9:] = [
                new_genotypes.get(g, g)
                for g in record[9:]
            ]
            # Remove '*' from ALTS column
            record[4] = ','.join(
                split_alts[:deletion_index-1]
                + split_alts[deletion_index:]
            )
        else:
            deletion_samples = set()
        open_records.append({
            'record': record,
            'open_deletions': set() if new_position > 1 else deletion_samples,
            'deletion_alts': [],
        })

        # Update earlier records
        for open_record in open_records:
            open_record_deletions = open_record['open_deletions']
            completed_deletions = open_record_deletions - deletion_samples
            if not completed_deletions:
                continue
            record = open_record['record']
            deletion_size = int(record[1])


        print(*record, sep='\t', file=sys.stdout, end='')


def create_new_record(sequence, pos, deletion_samples, num_samples):
    ref = sequence[pos-1:pos+1]
    alt = sequence[pos-1]
    record_info = [
        '1',  # CHROM
        str(pos),  # POS
        '.',  # ID
        ref,  # REF
        alt,  # ALT
        '.',  # QUAL
        '.',  # FILTER
        '.',  # INFO
        'GT',  # FORMAT
    ] + [
        '1' if i in deletion_samples else '0'
        for i in range(num_samples)
    ]
    return {
        'record': record_info,
        'open_deletions': deletion_samples,
        'deletion_alts': [],
    }


def update_record(record_details, pos, deletion_samples, pos_1=False):
    p1 = POS_1_PREFIX if pos_1 else ''
    record = record_details['record']
    record_open_deletions = record_details[f'{p1}open_deletions']
    dropped_deletions = record_open_deletions - deletion_samples
    # Remove deletions from set to check
    deletion_samples -= record_open_deletions
    if dropped_deletions:
        record_open_deletions -= dropped_deletions
        num_alts = (
                record[4].count(',') + 1
                + len(record_details[f'{POS_1_PREFIX}deletion_alts'])
                + len(record_details['deletion_alts'])
        )
        alt_gt = str(num_alts+1)
        record[9:] = [
            alt_gt if i in dropped_deletions else g
            for i, g in enumerate(record[9:])
        ]
        # record deletion size for this alt
        record_pos = int(record[1])
        record_details[f'{p1}deletion_alts'].append(
            (pos - record_pos - 1)
            if not pos_1
            else (pos - record_pos)
        )


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


if __name__ == '__main__':
    (
        fasta_file,
    ) = sys.argv[1:2]
    start_accession_id = sys.argv[5] if len(sys.argv) > 5 else None
    convert(fasta_file)

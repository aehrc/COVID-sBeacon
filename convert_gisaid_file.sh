#!/bin/bash
set -euxo pipefail

INPUT_VCF=$1
REFERENCE_FASTA=$2
OUTPUT_VCF=$3

bcftools view --no-version "${INPUT_VCF}" | ./convert_deletions.py "${REFERENCE_FASTA}" | bcftools view --no-version -Oz > "${OUTPUT_VCF}"
bcftools index "${OUTPUT_VCF}"

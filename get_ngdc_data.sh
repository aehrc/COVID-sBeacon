#!/bin/bash
set -e -x

REFERENCE_FILE=$1
METADATA_FILE=$2
BASE_VCF_DIRECTORY=$3
OUTPUT_PREFIX=$4

GISAID_ARRAY=(0 1)

mkdir -p "${BASE_VCF_DIRECTORY}"
for gisaid in "${GISAID_ARRAY[@]}"; do
  output_suffix="${gisaid}gisaid"
  final_output_prefix="${OUTPUT_PREFIX}${output_suffix}"
  ./from_gff3.py "${REFERENCE_FILE}" "${METADATA_FILE}" "${BASE_VCF_DIRECTORY}" "${gisaid}" \
   | ./combine_vcfs.sh "${REFERENCE_FILE}" "${final_output_prefix}"
  final_vcf="${final_output_prefix}.vcf.gz"
  if [[ -f "${final_vcf}" ]]; then
    bcftools query --list-samples "${final_vcf}" \
     | ./create_metadata.py "${METADATA_FILE}" "${final_output_prefix}.csv"
  fi
done

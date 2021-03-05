#!/bin/bash
set -euxo pipefail

INPUT_VCF=$1
INPUT_METADATA_CSV=$2
OUTPUT_PREFIX=$3
declare -i -r FIRST_SAMPLE=$4
declare -i -r LAST_SAMPLE=$5


tmp_dir=$(mktemp -d -t vcf_sample_slice-XXXXXXXXXXX)

sample_slice_file="${tmp_dir}/sample_slice"
vcf_slice="${OUTPUT_PREFIX}.vcf.gz"
(bcftools query --list-samples "${INPUT_VCF}" || test $? -eq 141) | head -n "${LAST_SAMPLE}" | tail -n +"${FIRST_SAMPLE}" > "${sample_slice_file}"
bcftools view "${INPUT_VCF}" --no-version --trim-alt-allele --min-ac 1 --output-type z --samples-file "${sample_slice_file}" > "${vcf_slice}"
bcftools index "${vcf_slice}"
slice_csv="${OUTPUT_PREFIX}.csv"
head "${INPUT_METADATA_CSV}" -n 1 > "${slice_csv}"
head -n $((LAST_SAMPLE+1)) "${INPUT_METADATA_CSV}" | tail -n +$((FIRST_SAMPLE+1)) >> "${slice_csv}"
rm -rf "${tmp_dir}"
exit
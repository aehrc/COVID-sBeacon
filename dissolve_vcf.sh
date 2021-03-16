#!/bin/bash
set -euxo pipefail

INPUT_VCF=$1
INPUT_METADATA_CSV=$2
MAXIMUM_SAMPLES_PER_SPLIT=$3
OUTPUT_PREFIX=$4

function extract_and_split() {
  declare -i -r first_sample=$1
  declare -i -r last_sample=$2
  if [[ $first_sample -eq 1 ]]; then
    output_prefix="${OUTPUT_PREFIX}0"
  else
    output_prefix="${OUTPUT_PREFIX}1"
  fi
  if [[ $((last_sample-first_sample+1)) -le MAXIMUM_SAMPLES_PER_SPLIT ]]; then
    final=true
    extract_prefix="${output_prefix}"
  else
    final=false
    tmp_dir=$(mktemp -d -t dissolve_vcf-XXXXXXXXXXX)
    extract_prefix="${tmp_dir}/slice${first_sample}-${last_sample}"
  fi
  ./extract_sample_slice.sh "${INPUT_VCF}" "${INPUT_METADATA_CSV}" "${extract_prefix}" "${first_sample}" "${last_sample}"
  if [[ "${final}" != true ]]; then
    ./dissolve_vcf.sh "${extract_prefix}.vcf.gz" "${extract_prefix}.csv" "${MAXIMUM_SAMPLES_PER_SPLIT}" "${output_prefix}" 1
#    rm -rf tmp_dir
  fi
}

declare -i -r num_samples=$(($(wc -l "${INPUT_METADATA_CSV}" | cut -d ' ' -f 1)-1))
if [[ "${num_samples}" -le "${MAXIMUM_SAMPLES_PER_SPLIT}" ]]; then
  echo "Already small enough (${num_samples} samples), copying to prefix."
  cp "${INPUT_VCF}" "${OUTPUT_PREFIX}.vcf.gz"
  cp "${INPUT_VCF}.csi" "${OUTPUT_PREFIX}.vcf.gz.csi"
  cp "${INPUT_METADATA_CSV}" "${OUTPUT_PREFIX}.csv"
else
  declare -i -r first_last_sample=$((num_samples/2))
  extract_and_split 1 "${first_last_sample}" &
  extract_and_split $((first_last_sample + 1)) "${num_samples}" &
  wait
fi

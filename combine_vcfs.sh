#!/bin/bash
set -e

REFERENCE_FILE=$1
OUTPUT_PREFIX=$2
VCF_DIRECTORIES=( "${@:3}" )

TMP_DIRECTORY="/tmp/${OUTPUT_PREFIX}"
MERGE_FILE="${TMP_DIRECTORY}/merge_files"
CALL_DIRECTORY=$(pwd)
if [[ ${REFERENCE_FILE:0:1} != "/" ]]; then
  REFERENCE_FILE="${CALL_DIRECTORY}/${REFERENCE_FILE}"
fi

mkdir -p "${TMP_DIRECTORY}"
echo "" > "${MERGE_FILE}"
for dir in "${VCF_DIRECTORIES[@]}"; do
  cd "${dir}"
  for vcf in *.vcf; do
    bcftools norm --output-type z --check-ref s --fasta-ref "${REFERENCE_FILE}" --no-version "${vcf}" > "${TMP_DIRECTORY}/${vcf}.gz"
    bcftools index "${TMP_DIRECTORY}/${vcf}.gz"
    echo "${TMP_DIRECTORY}/${vcf}.gz" >> "${MERGE_FILE}"
  done
  cd "${CALL_DIRECTORY}"
done


bcftools merge --force-samples --missing-to-ref --file-list "${MERGE_FILE}" --no-version --output-type z --threads 4 > "${OUTPUT_PREFIX}.vcf.gz"
bcftools index "${OUTPUT_PREFIX}.vcf.gz"

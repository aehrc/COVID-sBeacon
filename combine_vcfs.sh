#!/bin/bash
set -e -x

REFERENCE_FILE=$1
OUTPUT_PREFIX=$2
declare -i MAX_FILES_PER_MERGE=1000
TMP_DIRECTORY="/tmp/${OUTPUT_PREFIX}"
MERGE_FILE_PREFIX="${TMP_DIRECTORY}/sub_merge_"
FULL_MERGE_FILE="${TMP_DIRECTORY}/full_merge"
CALL_DIRECTORY=$(pwd)
if [[ ${REFERENCE_FILE:0:1} != "/" ]]; then
  REFERENCE_FILE="${CALL_DIRECTORY}/${REFERENCE_FILE}"
fi
rm -rf "${TMP_DIRECTORY}"
mkdir -p "${TMP_DIRECTORY}"
declare  -i sub_merge_number=0
declare -i merge_sample_num=0
while read -r vcf; do
  file_name="${TMP_DIRECTORY}/$(basename "${vcf}").gz"
  bcftools norm --output-type z --check-ref s --fasta-ref "${REFERENCE_FILE}" --no-version "${vcf}" > "$file_name"
  bcftools index "${file_name}"
  merge_sample_num=$((merge_sample_num + 1))
  if [[ $merge_sample_num -gt $MAX_FILES_PER_MERGE ]]; then
    merge_sample_num=0
    sub_merge_number=$((sub_merge_number + 1))
  fi
  echo "${file_name}" >> "${MERGE_FILE_PREFIX}${sub_merge_number}"
done

if [[ $sub_merge_number -gt 0 ]]; then
  for merge_file in "${MERGE_FILE_PREFIX}"*; do
    sub_merge_file="${merge_file}.vcf.gz"
    bcftools merge --missing-to-ref --file-list "${merge_file}" --no-version --output-type z --threads 4 > "${sub_merge_file}"
    bcftools index "${sub_merge_file}"
    echo "${sub_merge_file}" >> "${FULL_MERGE_FILE}"
  done
elif [[ $merge_sample_num == 0 ]]; then
  exit
else
  mv "${MERGE_FILE_PREFIX}"* "${FULL_MERGE_FILE}"
fi

bcftools merge --missing-to-ref --file-list "${FULL_MERGE_FILE}" --no-version --output-type z --threads 4 > "${OUTPUT_PREFIX}.vcf.gz"
bcftools index "${OUTPUT_PREFIX}.vcf.gz"

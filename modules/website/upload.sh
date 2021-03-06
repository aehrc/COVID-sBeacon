#!/bin/bash
set -e
cd beaconApp
echo -e "{\n \"apiBaseUrl\" : \"${3}\",\n \"login\" : ${4} \n}" > src/assets/config.json
npm ci
if [ ${5} = true ]
then
  node_modules/@angular/cli/bin/ng build --prod --subresourceIntegrity=true
else
  node_modules/@angular/cli/bin/ng build --subresourceIntegrity=true
fi
cd dist/beaconApp
aws s3 sync . "s3://${1}" --delete
#aws cloudfront create-invalidation --distribution-id ${2} --paths "/index.html"

#!/bin/bash
set -e
cd beaconApp
echo -e "{\n \"apiBaseUrl\" : \"${2}\",\n \"login\" : ${3} \n}" > src/assets/config.json
mkdir -p src/environments
echo -e "export const environment = {\n production: true, \n cloudfront_url: \"${4}\" \n };" >src/environments/environment.prod.ts
echo -e "export const environment = {\n production: true, \n cloudfront_url: \"${4}\" \n };" >src/environments/environment.ts
npm ci
node_modules/@angular/cli/bin/ng build --prod --subresourceIntegrity=true
cd dist/beaconApp
aws s3 sync . "s3://${1}" --delete

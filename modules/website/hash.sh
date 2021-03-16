#!/bin/bash
read -t 0.1 -n 10000 discard # drop whatever stdin gives us; we do not use it
cd beaconApp
HASH=$(find * -type f -not -path "dist/*" -not -path "node_modules/*" -not -path "src/environments/environment.prod.ts" -print0 | sort -z | xargs -0 sha1sum | sha1sum | cut -f1 -d ' ')
echo {\"hash\": \"${HASH}\"}

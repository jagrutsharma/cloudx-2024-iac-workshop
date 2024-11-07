#!/bin/bash
set -eo pipefail

rm -rf node_modules
npm install --production

echo "Deploy to dev: START"
echo "Deploying to dev environment 1 of 1, region us-east-1"
sam build
sam deploy --config-file samconfig-dev.toml --template-file template.yaml --region us-east-1
echo "Deploy to dev: COMPLETE"

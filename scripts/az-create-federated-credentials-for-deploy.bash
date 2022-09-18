#!/bin/bash
set -eo pipefail

printf 'Creating app for dev\n'
#az ad app create --display-name christianfosli/stellerom-dev
sleep 2
appId="$(az ad app list --display-name christianfosli/stellerom-dev --query [0].appId -o tsv)"
#az ad sp create --id "$appId"

printf 'Creating federated credentials for GitHub Actions\n'
cat << EOF > creds.json
{
  "name": "github-actions-dev",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:christianfosli/stellerom:environment:Development",
  "description": "Deploy to azure from GitHub actions",
  "audiences": ["api://AzureADTokenExchange"]
}
EOF
az ad app federated-credential create --id "$appId" --parameters creds.json

printf 'Creating app for prod\n'
#az ad app create --display-name christianfosli/stellerom-prod
sleep 2
appId="$(az ad app list --display-name christianfosli/stellerom-prod --query [0].appId -o tsv)"
#az ad sp create --id "$appId"

printf 'Creating federated credentials for GitHub Actions\n'
cat << EOF > creds.json
{
  "name": "github-actions-prod",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:christianfosli/stellerom:environment:Production",
  "description": "Deploy to azure from GitHub actions",
  "audiences": ["api://AzureADTokenExchange"]
}
EOF
az ad app federated-credential create --id $appId --parameters creds.json

printf '!!MANUAL STEP: Assign permissions in Azure portal\n'

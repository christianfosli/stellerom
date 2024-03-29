#!/bin/bash
set -eo pipefail

if [[ -z "$ENVIRONMENT" || -z "$SERVICE_NAME" || -z "$TARGET_PORT" ]]; then
  printf 'Usage: ENVIRONMENT={dev/prod} SERVICE_NAME={service-name} TARGET_PORT={target-port}  %s\n' "$0"
  exit 1
fi

printf 'Installing containerapp extension to az cli\n'
az extension add -n containerapp --upgrade
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.OperationalInsights

if [[ "$(az group exists -n "rg-stellerom-$ENVIRONMENT")" == "false" ]]; then
  printf 'Creating resource group\n'
  az group create -n "rg-stellerom-$ENVIRONMENT" -l norwayeast
else
  printf 'Resource group already exists\n'
fi

if az containerapp env show -n "cappenv-stellerom-$ENVIRONMENT" -g "rg-stellerom-$ENVIRONMENT"; then
  printf 'Containerapp env already exists\n'
else
  printf 'Creating containerapp env\n'
  az containerapp env create -n "cappenv-stellerom-$ENVIRONMENT" -g "rg-stellerom-$ENVIRONMENT" -l norwayeast
fi

if az containerapp show -n "capp-stellerom-$SERVICE_NAME-$ENVIRONMENT" -g "rg-stellerom-$ENVIRONMENT"; then
  printf 'Containerapp already exists\n'
else
  az containerapp create -n "capp-stellerom-$SERVICE_NAME-$ENVIRONMENT" -g "rg-stellerom-$ENVIRONMENT" \
    --environment "cappenv-stellerom-$ENVIRONMENT" \
    --image "ghcr.io/christianfosli/stellerom/$SERVICE_NAME:${GITHUB_SHA:-latest}" \
    --target-port "$TARGET_PORT" \
    --ingress 'external'
fi

# Manual Step: Configure CNAME record and validation with domain registrar
if az containerapp hostname list -n capp-stellerom-$SERVICE_NAME-$ENVIRONMENT -g "rg-stellerom-$ENVIRONMENT" \
  | grep "$SERVICE_NAME-$ENVIRONMENT.stellerom.no"; then
  printf 'Custom domain name already set up\n'
else
  printf 'Setting up custom hostname and TLS\nEnsure DNS is configured already\n'
  az containerapp hostname add -n "capp-stellerom-$SERVICE_NAME-$ENVIRONMENT" -g "rg-stellerom-$ENVIRONMENT" \
    --hostname "$SERVICE_NAME-$ENVIRONMENT.stellerom.no"

  az containerapp hostname bind -n "capp-stellerom-$SERVICE_NAME-$ENVIRONMENT" -g "rg-stellerom-$ENVIRONMENT" \
    --environment "cappenv-stellerom-$ENVIRONMENT" \
    --hostname "$SERVICE_NAME-$ENVIRONMENT.stellerom.no" --validation-method CNAME
fi

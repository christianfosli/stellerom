#!/bin/bash
set -eo pipefail

if [[ -z "$ENVIRONMENT" || -z "$SERVICE_NAME" || -z "$CRON_EXPRESSION" ]]; then
  printf 'Usage: ENVIRONMENT={dev/prod} SERVICE_NAME={service-name} CRON_EXPRESSION={cron_expression} %s\n' "$0"
  exit 1
fi

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

if az containerapp job show -n "caj-stellerom-$SERVICE_NAME-$ENVIRONMENT" -g "rg-stellerom-$ENVIRONMENT"; then
  printf 'Containerapp job already exists\n'
  az containerapp job update -n "caj-stellerom-$SERVICE_NAME-$ENVIRONMENT" -g "rg-stellerom-$ENVIRONMENT" \
    --cron-expression "$CRON_EXPRESSION" \
    --replica-timeout 300
else
  az containerapp job create -n "caj-stellerom-$SERVICE_NAME-$ENVIRONMENT" -g "rg-stellerom-$ENVIRONMENT" \
    --environment "cappenv-stellerom-$ENVIRONMENT" \
    --image "ghcr.io/christianfosli/stellerom/$SERVICE_NAME:${GITHUB_SHA:-latest}" \
    --trigger-type Schedule \
    --cron-expression "$CRON_EXPRESSION" \
    --replica-timeout 300 \
    --replica-retry-limit 2 \
    --replica-completion-count 1 \
    --parallelism 1
fi

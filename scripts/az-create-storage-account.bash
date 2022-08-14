#!/bin/bash
set -eo pipefail

if [[ -z "$1" ]] || [[ "$1" == "--help" ]]
then
  printf 'Usage: %s {env}\n\t{env}=dev|prod\nPrereq: Log in to azure CLI and choose the correct subscription\n' "$0"
  exit 1
fi

env="$1"

az storage account create -n "ststellerom${env}" -g "rg-stellerom-${env}" \
  -l norwayeast \
  --min-tls-version TLS1_2

if [[ "$env" == prod ]]
then
  origin="www.stellerom.no"
else
  origin="$env.stellerom.no"
fi

az storage cors add --methods GET --origins "$origin" --services b --account-name "ststellerom${env}"

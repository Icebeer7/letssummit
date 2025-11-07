#!/bin/bash

# Get AWS CodeArtifact token
export AWS_SDK_CODEARTIFACT_TOKEN=`aws codeartifact get-authorization-token --domain gigsky-dev --domain-owner 076544065911 --region us-east-1 --query authorizationToken --output text`

# Add token to Yarn config
yarn config set 'npmRegistries["https://gigsky-dev-076544065911.d.codeartifact.us-east-1.amazonaws.com/npm/client-sdk/"].npmAuthToken' "${AWS_SDK_CODEARTIFACT_TOKEN}"
yarn config set 'npmRegistries["https://gigsky-dev-076544065911.d.codeartifact.us-east-1.amazonaws.com/npm/client-sdk/"].npmAlwaysAuth' "true"

# Authenticate for npm
aws codeartifact login --tool npm --domain gigsky-dev --domain-owner 076544065911 --repository client-sdk
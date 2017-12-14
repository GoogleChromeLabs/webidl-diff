#!/bin/bash

export GCLOUD_SDK_VERSION="183.0.0"
export GCLOUD_PROJECT_ID="webidl-diff"

# Development host configuration
export H_APP_HOME=$(readlink -f "$(dirname $0)/..")
export H_BASE_IMAGE_TAG="webidl-diff-base"
export H_DEV_IMAGE_TAG="webidl-diff-dev"
export H_PROD_IMAGE_TAG="webidl-diff-dev"
export H_DEV_INSTANCE_NAME="webidl-diff-dev-instance"

# Container configuration
export C_USER_HOME=${USER_HOME:-/home/webidl-diff}
export C_USER_ID=1001
export C_USER_NAME=webidl-diff
export C_GROUP_ID=1001
export C_GROUP_NAME=webidl-diff
export C_USER_HOME="/home/${C_USER_NAME}"
export C_APP_HOME="${C_USER_HOME}/webidl-diff"

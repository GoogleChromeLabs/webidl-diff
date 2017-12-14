#!/bin/bash

set -evh

source $(dirname $0)/env.sh

CONfIG_DIR=$(dirname $0)/../config

docker build \
  --build-arg "GCLOUD_PROJECT_ID=${GCLOUD_PROJECT_ID}" \
  --build-arg "USER_HOME=${C_USER_HOME}" \
  --build-arg "APP_HOME=${C_APP_HOME}" \
  --build-arg "USER_ID=${C_USER_ID}" \
  --build-arg "USER_NAME=${C_USER_NAME}" \
  --build-arg "GROUP_ID=${C_GROUP_ID}" \
  --build-arg "GROUP_NAME=${C_GROUP_NAME}" \
  --build-arg "USER_HOME=${C_USER_HOME}" \
  -t "${H_BASE_IMAGE_TAG}" \
  -f "${CONfIG_DIR}/Dockerfile.base" \
  .

docker build \
  --build-arg "GCLOUD_SDK_VERSION=${GCLOUD_SDK_VERSION}" \
  -t "${H_DEV_IMAGE_TAG}" \
  -f "${CONfIG_DIR}/Dockerfile.dev" \
  .

# docker build \
  #     --build-arg "GCLOUD_SDK_VERSION=${GCLOUD_SDK_VERSION}" \
  #     --build-arg "GCLOUD_PROJECT_ID=${GCLOUD_PROJECT_ID}" \
  #     --build-arg "USER_HOME=${C_USER_HOME}" \
  #     --build-arg "USER_ID=${C_USER_ID}" \
  #     --build-arg "USER_NAME=${C_USER_NAME}" \
  #     --build-arg "GROUP_ID=${C_GROUP_ID}" \
  #     --build-arg "GROUP_NAME=${C_GROUP_NAME}" \
  #     --build-arg "USER_HOME=${C_USER_HOME}" \
  #     -t "${H_PROD_IMAGE_TAG}" \
  # -f "${CONfIG_DIR}/Dockerfile.prod" \
  #     .

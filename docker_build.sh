#!/bin/bash

set -evh

source $(dirname $0)/env.sh

docker build \
    --build-arg "USER_HOME=${C_USER_HOME}" \
    --build-arg "USER_ID=${C_USER_ID}" \
    --build-arg "USER_NAME=${C_USER_NAME}" \
    --build-arg "GROUP_ID=${C_GROUP_ID}" \
    --build-arg "GROUP_NAME=${C_GROUP_NAME}" \
    --build-arg "USER_HOME=${C_USER_HOME}" \
    -t "${H_IMAGE_TAG}" \
    -f Dockerfile \
    .

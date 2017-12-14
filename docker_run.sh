#!/bin/bash

set -vh

source $(dirname $0)/env.sh

docker run \
    -ti \
    --entrypoint /bin/bash \
    -v "${HOME}/.ssh:${C_USER_HOME}/.ssh:ro" \
    -v "${H_APP_HOME}:${C_APP_HOME}" \
    --name "${H_INSTANCE_NAME}" \
    "${H_IMAGE_TAG}"
docker stop "${H_INSTANCE_NAME}"
docker rm "${H_INSTANCE_NAME}"

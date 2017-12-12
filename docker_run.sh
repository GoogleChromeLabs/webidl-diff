#!/bin/bash

set -evh

source $(dirname $0)/env.sh

docker run \
    -t \
    -d \
    --entrypoint /bin/bash \
    -v "${HOME}/.ssh:${C_USER_HOME}/.ssh:ro" \
    -v "${H_APP_HOME}:${C_APP_HOME}" \
    --name "${H_INSTANCE_NAME}" \
    x
docker stop "${H_INSTANCE_NAME}"
docker rm "${H_INSTANCE_NAME}"

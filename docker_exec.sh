#!/bin/bash

set -evh

source $(dirname $0)/env.sh

docker exec \
    -ti \
    "${H_INSTANCE_NAME}" \
    /bin/bash

#!/bin/bash

set -evh

source $(dirname $0)/env.sh

docker exec \
  -ti \
  -u $(id -u $USER):$(id -g $USER) \
  "${H_DEV_INSTANCE_NAME}" \
  /bin/bash

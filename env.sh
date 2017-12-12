#!/bin/bash

# Host configuration
export H_APP_HOME=$(readlink -f $(dirname $0))
export H_IMAGE_TAG="webidl-diff"
export H_INSTANCE_NAME="webidl-diff-instance"

# Container configuration
export C_USER_HOME=${USER_HOME:-/home/webidl-diff}
export C_USER_ID=1001
export C_USER_NAME=webidl-diff
export C_GROUP_ID=1001
export C_GROUP_NAME=webidl-diff
export C_USER_HOME="/home/${C_USER_NAME}"
export C_APP_HOME="${C_USER_HOME}/webidl-diff"

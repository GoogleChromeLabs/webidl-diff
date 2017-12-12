FROM node:latest

ARG USER_NAME=webidl-diff
ARG USER_ID=1001
ARG GROUP_NAME=webidl-diff
ARG GROUP_ID=1001
ARG USER_HOME=/home/webidl-diff

# System setup (root)


# Local setup (user)
WORKDIR "${USER_HOME}"
USER "${USER_NAME}"

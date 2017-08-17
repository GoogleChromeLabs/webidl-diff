#!/bin/bash

# Sparse and shallow git repository fetch.
# $1 - path where local repository should be checked out.
# $2 - the URL of the remote repository.
# $3 - the repository-relative path where the sparse checkout lives.

if [ "$#" -ne 3 ]; then
  >&2 echo "USAGE: $0 <repo directory> <repo URL> <sparse path>"
  exit 1
fi

# Exit immediately if command exits with non-zero status.
set -e

GIT="/usr/bin/git"
RM="/bin/rm"
MKDIR="/bin/mkdir"

DIR="${1}"
URL="${2}"
SPARSE_PATH="${3}"

echo "::"
echo ":: Cloning \"${SPARSE_PATH}\" from \"${URL}\" into \"${DIR}\""
echo "::"

"${RM}" -rf "${DIR}"
"${MKDIR}" -p "${DIR}"
pushd "${DIR}" > /dev/null
"${GIT}" init
"${GIT}" remote add origin "${URL}"
if [ "${SPARSE_PATH}" != "" ]; then
  "${GIT}" config core.sparseCheckout true
  echo "${SPARSE_PATH}" >> .git/info/sparse-checkout
fi
"${GIT}" pull --depth=1 origin master
popd > /dev/null

#!/bin/bash

# Commit collected data back to Git repo.
# Initializing Git config.
echo "Initializing Git configuration."
git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"

# Synchronize branch with master.
echo "Synchronizing branch with master."
git remote set-url origin https://$GIT_TOKEN@github.com/GoogleChrome/webidl-diff.git > /dev/null 2>&1
git config --replace-all remote.origin.fetch +refs/heads/*:refs/remotes/origin/*
git fetch
git checkout dataCollection
git merge origin/master

# Run Data Collection.
echo "Beginning data collection."
mkdir -p data   # Ensure that this directory exists for data output.
node --max_old_space_size=4096 main/runner.js > /dev/null

# Upload the files.
if [ $? -eq 0 ]; then
  git add data/*
  git commit --message "Automated collection - Travis Build $TRAVIS_BUILD_NUMBER [skip ci]"
  git push --quiet --set-upstream origin dataCollection
  exit 0
else
  echo "Data collection did not run properly!"
  exit 1
fi

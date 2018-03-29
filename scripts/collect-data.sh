#!/bin/bash

# Run Data Collection.
echo "Beginning data collection."
mkdir -p data   # Ensure that this directory exists for data output.

node --max_old_space_size=4096 main/runner.js > /dev/null &
minutes=0
limit=45 # Timeout after 45 minutes
while kill -0 $! >/dev/null 2>&1; do
  echo -n -e " \b"
  if [ $minutes == $limit ]; then
    break;
  fi
  minutes=$((minutes+1))
  sleep 60
done

#!/usr/bin/env bash

# The root directory of the project is one up
cd "$(dirname $0)/.."
PROJECT_DIR=$PWD
echo "Project root is $PROJECT_DIR"

for subfolder in "server" "console" "test-api"; do
    cd "$PROJECT_DIR/$subfolder"
    echo "Updating $subfolder ..."
    npm update --include=dev --save
    echo ""
done

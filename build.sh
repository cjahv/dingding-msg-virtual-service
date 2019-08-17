#!/usr/bin/env bash
set -e
docker build -t dingding-msg-virtual-service .
docker run -d -p 6450:6450 --name dingding-msg-virtual-service --restart always dingding-msg-virtual-service

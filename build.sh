#!/usr/bin/env bash
set -e
[ ! "$1" ] && exit 1
docker build -t dingding-msg-virtual-service .
docker stop -t 0 dingding-msg-virtual-service||true
docker rm dingding-msg-virtual-service||true
docker run -d -p 6450:6450 --name dingding-msg-virtual-service -e ACCESS_TOKEN=$1 --restart always dingding-msg-virtual-service
docker logs -f dingding-msg-virtual-service

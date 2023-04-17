#!/bin/bash

while getopts c: flag
do
  case "${flag}" in
    c) containerName=${OPTARG};;
  esac
done

if [ "$(docker ps -q -f name=$containerName)" ];
then
  docker exec $containerName sh "/ws-localsync/.script/unregister.sh"
else
  echo "Container $containerName is not running"
  exit 1
fi

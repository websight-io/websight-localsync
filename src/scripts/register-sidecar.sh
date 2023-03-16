#!/bin/bash

containerName="local-compose-cms-1"

if [ "$( docker container inspect -f '{{.State.Running}}' $containerName)" == "true" ];
then
  docker exec $containerName sh "/ws-localsync/.script/register.sh"
else
  echo "Container $containerName is not running"
  exit 1
fi

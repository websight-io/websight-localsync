#!/bin/bash
#    Copyright (C) 2023 Dynamic Solutions
#
#    Licensed under the Apache License, Version 2.0 (the "License");
#    you may not use this file except in compliance with the License.
#    You may obtain a copy of the License at
#
#        http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS,
#    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    See the License for the specific language governing permissions and
#    limitations under the License.

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

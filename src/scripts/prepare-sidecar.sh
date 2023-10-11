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

mkdir -p ~/.ws-localsync/.script

cp ../sidecar.js ~/.ws-localsync/.script/index.js

touch ~/.ws-localsync/.script/package.json
echo '{"type": "module"}' > ~/.ws-localsync/.script/package.json

cp ./install-node.sh ~/.ws-localsync/.script
chmod +x ~/.ws-localsync/.script/install-node.sh

cp ./register.sh ~/.ws-localsync/.script
chmod +x ~/.ws-localsync/.script/register.sh

cp ./unregister.sh ~/.ws-localsync/.script
chmod +x ~/.ws-localsync/.script/unregister.sh

mkdir -p ~/.ws-localsync/content

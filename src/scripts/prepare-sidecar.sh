#!/bin/bash

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

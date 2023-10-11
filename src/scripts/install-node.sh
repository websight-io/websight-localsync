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

initNvm() {
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"                   # This loads nvm
}

installNode() {
  # Hydrogen is v18.x.y
  nvm install --lts=hydrogen --default;
}

initNvm;
command -v nvm;
if [ $? -ne 0 ]
then
  echo "=== Installing nvm... ==="
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
  initNvm;
else
  echo "=== nvm is already installed, skipping installation ==="
fi

command -v node;
if [ $? -ne 0 ]
then
  echo "=== Installing node... ==="
  installNode;
else
  nodeVersion=$(node -v);
  # Check if node version is v18.x.y
  if [ -n "${nodeVersion%%v18\.*}" ]
  then
    echo "=== node is already installed, but with a wrong version, installing correct one... ==="
    installNode;
  else
    echo "=== node is already installed with the correct version (version: $(node -v)), skipping installation ==="
  fi
fi

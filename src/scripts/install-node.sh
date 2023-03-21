#!/bin/bash

initNvm() {
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"                   # This loads nvm
}

initNvm;
command -v nvm;
if [ $? -ne 0 ]
then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
  initNvm;
else
  echo "=== nvm is already installed, skipping installation ==="
  nvm use node;
fi

command -v node;
if [ $? -ne 0 ]
then
  # TODO check right node version as well
  # Hydrogen is v18.x.y
  nvm install --lts=Hydrogen;
else
  echo "=== node is already installed (version: $(node -v)), skipping installation ==="
fi

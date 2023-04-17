#!/bin/bash

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

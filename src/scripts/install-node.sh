#!/bin/bash

if ! command -v nvm &>/dev/null; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"                   # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # This loads nvm bash_completion
else
  echo "nvm is already installed, skipping installation"
fi

if ! command -v node &>/dev/null; then
  # TODO check right node version as well
  # TODO check with Hydrogen (v18)
  # Gallium is v16.x.y
  nvm install --lts=Gallium
else
  echo "node is already installed, skipping installation"
fi

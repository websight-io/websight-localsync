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

FILE=./.npm-snapshot

publishSnapshot() {
  BUILD_NUMBER=$1;
  echo "Publishing snapshot #$BUILD_NUMBER";
  BUILD_TAG=$(npm-snapshot $BUILD_NUMBER);
  npm publish --tag $BUILD_TAG;
}

updateSnapshotInFile() {
  echo "Updating snapshot in file";
  echo $1 > $FILE;
}

handlePublishing() {
  publishSnapshot $1;
  updateSnapshotInFile $1;
}

if [ -f "$FILE" ];
then
  FILE_NUMBER=$(cat $FILE);
  NEXT_NUMBER=$(($FILE_NUMBER+1));
  handlePublishing $NEXT_NUMBER;
else
  touch $FILE;
  handlePublishing 1;
fi

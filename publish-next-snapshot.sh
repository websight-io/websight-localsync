#!/bin/bash

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

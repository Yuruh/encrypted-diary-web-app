#!/bin/bash

set -e

CURRENT_TAG=$(git describe --abbrev=0)
VERSION=$1
TAG_MESSAGE=$2

usage() {
    echo "USAGE:"
    echo "./deploy.sh MAJOR|MINOR TAG_MESSAGE"
}

if [ $# -lt 2 ]
then
  usage;
  exit 1;
fi


# Coud be refactored to find n value
major=$(gawk 'match($0, /[0-9]+/) {
  print substr($0, RSTART, RLENGTH)
};' <<< $CURRENT_TAG)

minor=$(gawk 'match($0, /[0-9]+/) {
  remaining=substr($0, RLENGTH + 2)
}; match(remaining, /[0-9]+/) {
  print substr(remaining, RSTART, RLENGTH)
};' <<< $CURRENT_TAG)

if [ $VERSION = "MAJOR" ]
then
  let "major+=1"
  let "minor=0"
elif [ $VERSION = "MINOR" ]
then
  let "minor+=1"
else
  usage;
  return 1
fi

NEXT_VERSION="$major.$minor"

echo Building version $NEXT_VERSION

docker build -t yuruh/encrypted-diary-web-app:$NEXT_VERSION .

git tag -a $NEXT_VERSION -m "$TAG_MESSAGE"

git push origin --tags

docker push yuruh/encrypted-diary-web-app:$NEXT_VERSION
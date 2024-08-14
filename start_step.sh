#!/bin/bash


set -e

echo "Start script"


cd ./gambler


if [ -d dist ]; then
  rm -rf dist
fi


npm run build


cp -r dist ../backend


cd ../backend


npm run start
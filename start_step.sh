#!/bin/bash


set -e

echo "Start script"


cd ./frontend


if [ -d dist ]; then
  rm -rf dist
fi


npm run build


cp -r dist ../backend


cd ../backend


npm run start
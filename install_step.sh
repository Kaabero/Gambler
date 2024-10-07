#!/bin/bash


set -e

echo "Install script"

npm install

cd ./backend 
npm install


cd ../gambler 
npm install
#!/bin/bash

echo "Start script"


cd ./frontend && rm -rf dist && npm run build && cp -r dist ../backend
cd ./backend && npm run start
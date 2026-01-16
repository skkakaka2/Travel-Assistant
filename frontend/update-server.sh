#!/bin/sh

cp .env.production dist/.env

mkdir -p dist/log

mkdir -p dist/ngconf

cp ngconf/default.conf dist/ngconf/default.conf

cp docker-entrypoint.sh dist/docker-entrypoint.sh

tar -cvf dist.tar -C dist .

if [ ! -d "/home/aaa/travelassistantFrontend" ]; then
    mkdir -p /home/aaa/travelassistantFrontend
fi

sudo rm -rf /home/aaa/travelassistantFrontend/*

# scp dist.tar aaa@192.168.31.119:/home/aaa/travelassistant

scp dist.tar aaa@127.0.0.1:/home/aaa/travelassistantFrontend/dist.tar

tar -xvf /home/aaa/travelassistantFrontend/dist.tar -C /home/aaa/travelassistantFrontend/

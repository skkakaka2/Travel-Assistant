#!/bin/sh

cp .env.production dist/.env
cp docker-entrypoint.sh dist/
cp package.json dist/
cp pnpm-lock.yaml dist/

tar -cvf dist.tar -C dist .

if [ ! -d "/home/aaa/travelassistant" ]; then
    mkdir -p /home/aaa/travelassistant
fi

rm -rf /home/aaa/travelassistant/*

# scp dist.tar aaa@192.168.31.119:/home/aaa/travelassistant

scp dist.tar aaa@127.0.0.1:/home/aaa/travelassistant/dist.tar

tar -xvf /home/aaa/travelassistant/dist.tar -C /home/aaa/travelassistant/

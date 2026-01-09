#!/bin/sh

cd /app || exit 1

# 全局安装PM2
npm install -g pm2

npm install -g pnpm

pnpm install

# 启动dist下的main
pm2 start main.js --name travel-assistant --no-daemon

#!/bin/sh

cd /app

mkdir -p /app/uploads

nginx -t

exec nginx -g "daemon off;"

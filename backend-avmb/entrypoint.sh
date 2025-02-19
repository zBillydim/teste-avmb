#!/bin/sh

chown -R duser:duser /app

cd /src

yarn

yarn migration:run

# yarn build

yarn dev

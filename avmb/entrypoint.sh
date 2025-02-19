#!/bin/sh

chown -R duser:duser /app

cd /src

yarn

yarn dev

#!/usr/bin/env bash
cd "$(dirname "$0")"
dir="$(pwd)"
cd $dir
cd $dir
cd ..
cd ..
dir="$(pwd)"
echo $dir


pm2 startOrGracefulReload devops/deploy_scripts/pm2/example.pm2.config.js

#!/usr/bin/env bash
cd "$(dirname "$0")"
dir="$(pwd)"
cd $dir
cd $dir
cd ..
cd ..
dir="$(pwd)"
echo $dir


#create link to the pm2 that you want to actually run against
pm2 startOrGracefulReload devops/deploy_scripts/pm2/active.pm2.config.js

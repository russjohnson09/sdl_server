#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
dir="$(pwd)"
cd $dir
cd $dir
cd ..
cd ..
dir="$(pwd)"
echo $dir
echo whoami

sudo cp .env-2 .env
npm run db-migrate-up
npm run build


#sudo cp .env-2 .env
#npm run db-migrate-up
#npm run build

./devops/deploy_scripts/start_pm2.sh
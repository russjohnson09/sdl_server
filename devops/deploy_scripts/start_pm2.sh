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
#sudo ln -s "devops/deploy_scripts/pm2/glc-oem.pm2.config.js" "devops/deploy_scripts/pm2/active.pm2.config.js" || true
#sudo ln -s /home/ubuntu/sdl_policy_servers/glc-oem/devops/deploy_scripts/pm2/glc-oem.pm2.config.js /home/ubuntu/sdl_policy_servers/glc-oem/devops/deploy_scripts/pm2/active.pm2.config.js
#sudo ln -s /home/ubuntu/sdl_policy_servers/russjohnson09-oem/devops/deploy_scripts/pm2/russjohnson09-oem.pm2.config.js /home/ubuntu/sdl_policy_servers/glc-oem/devops/deploy_scripts/pm2/active.pm2.config.js

pm2 startOrGracefulReload devops/deploy_scripts/pm2/active.pm2.config.js

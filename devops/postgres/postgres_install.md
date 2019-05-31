https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-18-04

sudo apt update
sudo apt install postgresql postgresql-contrib

sudo -u postgres psql


ubuntu@ip-172-31-41-60:~/sdl_server$ psql --version
psql (PostgreSQL) 10.8 (Ubuntu 10.8-0ubuntu0.18.04.1)



```sql
CREATE DATABASE sdl_server;
CREATE USER livio WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE sdl_server TO livio;
```




sudo -u postgres psql

createuser --interactive


createdb greatlakescode_oem


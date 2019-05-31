https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-18-04

sudo apt update
sudo apt install postgresql postgresql-contrib

sudo -u postgres psql


```sql
CREATE DATABASE sdl_server;
CREATE USER livio WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE sdl_server TO livio;
```




sudo -u postgres psql

createuser --interactive


createdb greatlakescode_oem


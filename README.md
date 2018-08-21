# nfgm-backend
Proxy server for Natural Fresh Grocery and Meat Website

### Install and Run as Service
Please create an environment file containing:
```
NFGM_EMAIL=<email address>
NFGM_DB_PASS=<password>
```
Where "email address" is the address registered in Firebase for the
"backend user" and "password" is the corresponding password.

Then run the script "service/install_service.sh" as follows:
```
install_service.sh <path to local nfgm-backend clone>\
                   <path to directory containing local nfgm-frontend clone>\
                   <path to environment file>\
```
This should start a systemd service running the backend.
Please note that the server's running directory is local clone of the
frontend. This script will try to create the frontend if the user wants.

### Install and Run as User Program
With environment variables exported (following the pattern above), please run:
```sh
npm install
npm start
```


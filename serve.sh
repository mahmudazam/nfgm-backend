#!/bin/bash

pushd ~/exim-food
sudo -E nohup npm start 1>| ~/nfgm_server.log 2>| ~/nfgm_server.err &
popd


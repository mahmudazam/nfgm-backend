#!/bin/sh

###############################################################################
# Configuration:

# Check arguments:
if [ $# -lt "2" ]; then
    printf 'usage: install_service.sh <source directory> %s\n'\
           '<target directory> [environment file]'
    exit 1
fi

# Set up variables:
SOURCE_DIR=$(realpath $1)
TARGET_DIR=$(realpath $2)
FRONTEND_TARGET=$TARGET_DIR/nfgm-frontend
BACKEND_TARGET=/etc/nfgm-backend
ENV_FILE=$SOURCE_DIR/service/env_placeholder
FRONTEND_REPOSITORY='https://github.com/mahmudfasihulazam/nfgm-frontend.git'

if [ $# = "3" ];then
    ENV_FILE=$3
fi

###############################################################################
# Utility functions:

install_file() {
    SRC=$1
    DEST=$2
    echo "    $1 -> $2"
    cp -r $1 $2
}

safe_mkdir() {
    if [ -e $1 ]; then
        echo "WARNING: Will remove "$1!
        echo -n "Proceed? (yes/no) "
        read INPUT
        if [ $INPUT = "yes" ]; then
            rm -rf $1
        else
            return 1
        fi
    fi
    mkdir $1
}

###############################################################################
# Installation:

# Install frontend:
safe_mkdir $TARGET_DIR
if [ $? = '0' ]; then
    echo # empty line
    CWD=$(pwd)
    cd $TARGET_DIR
    echo Downloading website...
    git clone $FRONTEND_REPOSITORY
    cd nfgm-frontend
    echo Installing website...
    npm install
    cd $CWD
    echo '-----'
fi

# Install backend:
echo # empty line
echo Installing server...
safe_mkdir $BACKEND_TARGET
if [ $? -ne 0 ]; then
    echo "ERROR: Could not create backend directory. Exiting..."
    exit 1
fi
install_file $SOURCE_DIR/server.js $BACKEND_TARGET
install_file $SOURCE_DIR/package.json $BACKEND_TARGET
install_file $SOURCE_DIR/util $BACKEND_TARGET
CWD=$pwd
cd $BACKEND_TARGET
npm install
cd $CWD
echo '-----'

# Install service file:
echo # empty line
echo Installing service...

echo Service File:
sed 's:_NODE_:'"$(which node):g"\
    $SOURCE_DIR/service/nfgm-backend.service_template\
    > /etc/systemd/system/nfgm-backend.service
cat /etc/systemd/system/nfgm-backend.service
echo '-----'

# Install environment file:
echo # empty line
echo Installing environment file:
cat $ENV_FILE > temp
echo "PUBLIC_PATH=$FRONTEND_TARGET/public/" >> temp
echo Environment file:
cat temp
install_file temp $BACKEND_TARGET/nfgm-backend.env
rm -f temp
echo '-----'

# Start up service:
echo # empty line
echo 'Starting up service...'
systemctl daemon-reload
systemctl start nfgm-backend
echo '-----'

echo # empty line
echo '----------'
echo 'Done'

###############################################################################


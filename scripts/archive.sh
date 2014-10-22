#!/bin/bash

echo "======================"
echo "Create a TAR ball to deploy on target machine "
echo "${PWD}" 
echo "----------------------"
rm -f /tmp/hydra.tgz
cd ..
tar cfz /tmp/hydra.tgz --exclude=.vagrant/* --exclude=scripts/* --exclude=.git --exclude=Vagrantfile .

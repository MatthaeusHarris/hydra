#!/bin/bash


GROUP_NAME="hydra"
MICRO_NAME="Hydra"

CIDR_SPLUNK_OFFICE="204.107.141.0/24"

# This is setup for the VPC CIDR ( Should think about configuring this if there are mulitple VPC's ) 
CIDR_VPC="10.0.0.0/8"

# =====================
# The Security Group has a 
# ---------------------
VPC_ID=${1}


echo "======================"
echo "Creating Security Group [ ${GROUP_NAME} ] for [ ${VPC_ID} ] "  
echo "----------------------" 

aws ec2 create-security-group  --group-name ${GROUP_NAME}  --vpc-id ${VPC_ID} --description "Security Group used for Microservice ${MICRO_NAME}"


aws ec2 authorize-security-group-ingress --group-name ${GROUP_NAME} --protocol tcp --port 22 --cidr ${CIDR_SPLUNK_OFFICE}

aws ec2 authorize-security-group-ingress --group-name ${GROUP_NAME} --protocol tcp --port 22 --cidr ${CIDR_VPC}


aws ec2 authorize-security-group-ingress --group-name ${GROUP_NAME} --protocol tcp --port 80 --cidr ${CIDR_SPLUNK_OFFICE}

aws ec2 authorize-security-group-ingress --group-name ${GROUP_NAME} --protocol tcp --port 80 --cidr ${CIDR_VPC}

aws ec2 authorize-security-group-ingress --group-name ${GROUP_NAME} --protocol tcp --port 3000 --cidr ${CIDR_SPLUNK_OFFICE}

aws ec2 authorize-security-group-ingress --group-name ${GROUP_NAME} --protocol tcp  --port 3000 --cidr ${CIDR_VPC}

#!/bin/bash
# use the correct cluster when deploying application

export GOOGLE_COMPUTE_ZONE=${GOOGLE_COMPUTE_ZONE_DEVELOPMENT}
export GOOGLE_PROJECT_NAME=${GOOGLE_PROJECT_NAME_DEVELOPMENT}
export GOOGLE_CLUSTER_NAME=${GOOGLE_CLUSTER_NAME_DEVELOPMENT}

echo ${GCLOUD_SERVICE_KEY} | base64 -d > ${HOME}/gcp-key.json
gcloud auth activate-service-account --key-file ${HOME}/gcp-key.json
gcloud --quiet config set compute/zone ${GOOGLE_COMPUTE_ZONE}
gcloud --quiet config set project ${GOOGLE_PROJECT_NAME}
gcloud --quiet container clusters get-credentials ${GOOGLE_CLUSTER_NAME}
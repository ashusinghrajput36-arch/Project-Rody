# IBM Cloud App ID - Node.js Sample Application

This repository contains a sample Node.js application that demonstrates how to protect web apps with [IBM Cloud App ID](https://www.ibm.com/cloud/app-id).

## About

The App ID service helps you secure and add authentication to your cloud-native applications and APIs. This sample application is a simple Express.js web app with a "Login" button and a protected page that is only accessible after a user authenticates with App ID.

This sample is designed to be used as a template. When downloaded from the App ID dashboard, it is pre-configured with your service credentials.

[![Build Status][img-travis-master]][url-travis-master]
[![Coverage Status][img-coveralls-master]][url-coveralls-master]
[![Codacy Grade][img-codacy]][url-codacy]
[![Node.js Version][img-node-badge]][url-node-badge]
[![IBM Cloud Powered][img-ibmcloud-powered]][url-ibmcloud]

[![GitHub Watchers][img-github-watchers]][url-github-watchers]
[![GitHub Stars][img-github-stars]][url-github-stars]
[![GitHub Forks][img-github-forks]][url-github-forks]

## Table of Contents
* [About](#about)
* [Prerequisites](#prerequisites)
* [Running Locally](#running-locally)
* [Deploying to Cloud Foundry](#deploying-to-cloud-foundry)
* [Deploying to Kubernetes](#deploying-to-kubernetes)
* [Important Notes](#important-notes)
* [Getting Help](#getting-help)
* [License](#license)

### Application Files

`app.js`  Uses Express to set the routes.

`public/index.html`  The application landing page. Click **Login** to start.

`protected/protected.html`  The application's protected page. After clicking the **Login** button, the user is redirected here. This is where
we check whether the user is authorized or not. In the case where the user is not authorized, we send a request to the
authentication server to start the OAuth flow. If the user is authorized, we show the protected data.

## Prerequisites

*   Node.js version 6.0.0 or higher.
*   An instance of the IBM Cloud App ID service.
*   IBM Cloud CLI for cloud deployments.

## Running Locally
Run the following commands:
```bash
npm install
npm start
```
Use the link http://localhost:3000 to load the web application in browser.

## Running in Cloud Foundry

### Prerequisites
Before you begin, make sure that IBM Cloud CLI is installed.
For more information visit: https://cloud.ibm.com/docs/cli?topic=cloud-cli-getting-started.

### Deployment

**Important:** Before going live, remove http://localhost:3000/* from the list of web redirect URLs located in "Manage Authentication" -> "Authentication Settings" page in the AppID dashboard.

1. Login to IBM Cloud.

  `ibmcloud login -a https://api.{{domain}}`

2. Target a Cloud Foundry organization and space in which you have at least Developer role access:

  Use `ibmcloud target --cf` to target Cloud Foundry org/space interactively.

3. Bind the sample app to the instance of App ID:

  `ibmcloud resource service-alias-create "appIDInstanceName-alias" --instance-name "appIDInstanceName" -s {{space}}`
  
4. Add the alias to the manifest.yml file in the sample app.

   ```
   applications:
        - name: [app-instance-name]
        memory: 256M
        services:
        - appIDInstanceName-alias
   ```

5. Deploy the sample application to IBM Cloud. From the app's folder do:

  `ibmcloud app push`
  
6. Now configure the OAuth redirect URL at the App ID dashboard so it will approve redirecting to your cluster. Go to your App ID instance at [IBM Cloud console](https://cloud.ibm.com/resources) and under Manage Authentication->Authentication Settings->Add web redirect URLs add the following URL:

   `https://{App Domain}/ibm/cloud/appid/callback`
   
   You find your app's domain by visiting Cloud Foundry Apps at the IBM Cloud dashboard: https://cloud.ibm.com/resources.

7. Open your IBM Cloud app route in the browser.

## Running in Kubernetes

### Prerequisites
Before you begin make sure that IBM Cloud CLI, docker and kubectl installed and that you have a running kubernetes cluster.
You also need an IBM Cloud container registry namespace (see https://cloud.ibm.com/kubernetes/registry/main/start). You can find your registry domain and repository namespace using `ibmcloud cr namespaces`.

### Deployment

**Important:** Before going live, remove http://localhost:3000/* from the list of web redirect URLs located in "Manage Authentication" -> "Authentication Settings" page in the AppID dashboard.

**Note:** Your App ID instance name must consist of lower case alphanumeric characters, '-' or '.', and must start and end with an alphanumeric character. You can visit the App ID dashboard to change your instance name. 

1. Login to IBM Cloud.

    `ibmcloud login -a https://api.{{domain}}`
  
2. Run the following command, it will output an export command.

    `ibmcloud cs cluster-config {CLUSTER_NAME}`
    
3. Set the KUBECONFIG environment variable. Copy the output from the previous command and paste it in your terminal. The command output looks similar to the following example:
   
    `export KUBECONFIG=/Users/$USER/.bluemix/plugins/container-service/clusters/mycluster/kube-config-hou02-mycluster.yml`

4. Bind the instance of App ID to your cluster.

    `ibmcloud cs cluster-service-bind {CLUSTER_NAME} default {APP_ID_INSTANCE_NAME}`
    
5. Find your cluster's public endpoint {CLUSTER_ENDPOINT}.
   
   Note: If you are using the free version of kubernetes (with only 1 worker node) you can use your node's public IP instead, which you can find using:

    `ibmcloud cs workers {CLUSTER_NAME}`

6. Edit the kube_deployment.yml file. 
    1. Edit the image field of the deployment section to match your image name. The name of your image should be `{REGISTRY_DOMAIN}/{REPOSITORY_NAMESPACE}/appid-node-sample:{APP_VERSION}`). 
    2. Edit the Binding name field to match yours. It should be `binding-{APP_ID_INSTANCE_NAME}`.
    3. Edit redirectUri's value to include your cluster's IP. The value should be `http://{CLUSTER_ENDPOINT}/ibm/cloud/appid/callback`
    4. Optional: Change the value of metadata.namespace from default to your cluster namespace if you’re using a different namespace.

7. Build your Docker image.
   
    `docker build -t {REGISTRY_DOMAIN}/{REPOSITORY_NAMESPACE}/appid-node-sample:{APP_VERSION} .`
    
8. Push the image.
   
    `docker push {REGISTRY_DOMAIN}/{REPOSITORY_NAMESPACE}/appid-node-sample:{APP_VERSION}`
   
    `kubectl apply -f kube_deployment.yml`

9. Now configure the OAuth redirect URL at the App ID dashboard so it will approve redirecting to your cluster. Go to your App ID instance at [IBM Cloud console](https://cloud.ibm.com/resources) and under Manage Authentication->Authentication Settings->Add web redirect URLs add the following URL:

   `https://{CLUSTER_ENDPOINT}:30000/ibm/cloud/appid/callback`

10. You can see your sample running on Kubernetes in IBM Cloud.
   
    `open http://{CLUSTER_ENDPOINT}:30000`

## Clarification
This sample runs on one instance and uses the session to store the authorization data.
In order to run it in production mode, use services such as Redis to store the relevant data.


## Got Questions?
Join us on [Slack](https://www.ibm.com/cloud/blog/announcements/get-help-with-ibm-cloud-app-id-related-questions-on-slack) and chat with our dev team.

## See More
#### Protecting Node.js Web Applications with IBM Cloud App ID
https://www.youtube.com/watch?v=6roa1ZOvwtw

## License

Copyright (c) 2019 IBM Corporation

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[img-ibmcloud-powered]: https://img.shields.io/badge/ibm%20cloud-powered-blue.svg
[url-ibmcloud]: https://www.ibm.com/cloud/

[img-node-badge]: https://img.shields.io/badge/platform-node-lightgrey.svg?style=flat
[url-node-badge]: https://developer.node.com/index.html

[img-travis-master]: https://travis-ci.org/ibm-cloud-security/app-id-sample-node.svg?branch=master
[url-travis-master]: https://travis-ci.org/ibm-cloud-security/app-id-sample-node?branch=master

[img-coveralls-master]: https://coveralls.io/repos/github/ibm-cloud-security/app-id-sample-node/badge.svg
[url-coveralls-master]: https://coveralls.io/github/ibm-cloud-security/app-id-sample-node

[img-codacy]: https://api.codacy.com/project/badge/Grade/fb042b4cb2f048968b567cde2251edcc
[url-codacy]: https://www.codacy.com/app/ibm-cloud-security/app-id-sample-node

[img-github-watchers]: https://img.shields.io/github/watchers/ibm-cloud-security/app-id-sample-node.svg?style=social&label=Watch
[url-github-watchers]: https://github.com/ibm-cloud-security/app-id-sample-node/watchers
[img-github-stars]: https://img.shields.io/github/stars/ibm-cloud-security/app-id-sample-node.svg?style=social&label=Star
[url-github-stars]: https://github.com/ibm-cloud-security/app-id-sample-node/stargazers
[img-github-forks]: https://img.shields.io/github/forks/ibm-cloud-security/app-id-sample-node.svg?style=social&label=Fork
[url-github-forks]: https://github.com/ibm-cloud-security/app-id-sample-node/network

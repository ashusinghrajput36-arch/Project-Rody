# IBM Cloud App ID - Node.js Sample Application

This repository contains a sample Node.js application that demonstrates how to protect web apps with [IBM Cloud App ID](https://www.ibm.com/cloud/app-id).

## Live Deployment
- **Live URL:** https://project-rody-25n8.vercel.app/

## About

The App ID service helps you secure and add authentication to your cloud-native applications and APIs. This sample application is a simple Express.js web app with a "Login" button and a protected page that is only accessible after a user authenticates with App ID.

This sample is designed to be used as a template. When downloaded from the App ID dashboard, it is pre-configured with your service credentials.

## Table of Contents
- [Live Deployment](#live-deployment)
- [About](#about)
- [Prerequisites](#prerequisites)
- [Running Locally](#running-locally)
- [Deploying to Cloud Foundry](#deploying-to-cloud-foundry)
- [Deploying to Kubernetes](#deploying-to-kubernetes)
- [Important Notes](#important-notes)
- [Getting Help](#getting-help)
- [License](#license)

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

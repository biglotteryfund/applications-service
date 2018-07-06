# Applications Service

Internal service for managing applications

[![Build Status](https://travis-ci.org/biglotteryfund/applications-service.svg?branch=master)](https://travis-ci.org/biglotteryfund/applications-service)

## Getting Started

### Install dependencies

```sh
npm install
```

### Define environment config

Create a `.env` file with the following properties.

```
MYSQL_CONNECTION_URI=mysql://some-mysql-connection-string
MS_CLIENT_ID=<app ID from Azure>
MS_CLIENT_SECRET=<secret key from Azure>
MS_REDIRECT_URL=<URL to return to for auth ending in /user/auth/openid/return>
MS_ALLOW_HTTP=<true for dev>
```

### Run the app

```
npm run startDev
```

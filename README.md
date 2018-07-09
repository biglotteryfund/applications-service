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
DB_CONNECTION_URI=mysql://some-mysql-connection-string
MS_IDENTITY_URL=<org sign-in URL>
MS_CLIENT_ID=<app ID from Azure>
MS_CLIENT_SECRET=<secret key from Azure>
MS_REDIRECT_URL=<URL to return to for auth ending in /user/auth/openid/return>
MS_ALLOW_HTTP=<true for dev>
MS_LOGOUT_URL=<url to redirect to after logout>
MS_COOKIE_ENC_KEY_1=<32 char string>
MS_COOKIE_ENC_IV_1=<12 char string>
MS_COOKIE_ENC_KEY_2=<32 char string>
MS_COOKIE_ENC_IV_2=<12 char string>
SESSION_SECRET=<32 char string>
SENTRY_DSN=<sentry dsn>
```

### Run the app

```
npm run startDev
```

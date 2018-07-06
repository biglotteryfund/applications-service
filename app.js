'use strict';
const express = require('express');
const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    require('dotenv').config();
}

const app = express();

app.use('/', require('./apps/dashboard'));
app.use('/api', require('./apps/api'));
app.use('/user', require('./apps/user'));

module.exports = app;

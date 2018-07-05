'use strict';
require('dotenv').config();

const express = require('express');

const app = express();

app.use('/', require('./apps/dashboard'));
app.use('/api', require('./apps/api'));

module.exports = app;

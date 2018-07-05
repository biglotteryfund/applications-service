'use strict';
const express = require('express');
const logger = require('morgan');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/add-application', function(req, res) {
    res.json({
        status: 'success'
    });
});

module.exports = app;

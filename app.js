'use strict';
const express = require('express');
const logger = require('morgan');

const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    require('dotenv').config();
}
const passportMiddleware = require('./services/passport');
const sessionMiddleware = require('./services/session');
const bodyParserMiddleware = require('./services/bodyParser');
const viewEngine = require('./services/viewEngine');

const app = express();

// Set up templating
app.set('view engine', 'njk').set('engineEnv', viewEngine(app));

// Configure middleware
app.use(logger('dev'));
app.use(bodyParserMiddleware);
app.use(sessionMiddleware(app));
app.use(passportMiddleware());

// Mount routes
app.use('/dashboard', require('./apps/dashboard'));
app.use('/api', require('./apps/api'));
app.use('/user', require('./apps/user'));

// Handle errors
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    res.send({err, req, res});
});


module.exports = app;

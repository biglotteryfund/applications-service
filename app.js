'use strict';
const express = require('express');
const logger = require('morgan');
const moment = require('moment');

const LAUNCH_DATE = moment();

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

app.get('/status', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Cache-Control', 'no-store,no-cache,max-age=0');
    res.json({
        START_DATE: LAUNCH_DATE.format('dddd, MMMM Do YYYY, h:mm:ss a'),
        UPTIME: LAUNCH_DATE.toNow(true)
    })
});

// Handle errors
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    res.send({err});
});


module.exports = app;

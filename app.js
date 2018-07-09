'use strict';
const express = require('express');
const logger = require('morgan');
const moment = require('moment-timezone');
const nunjucks = require('nunjucks');
const Raven = require('raven');

const app = express();

const environment = process.env.NODE_ENV || 'development';
const isDev = environment === 'development';

if (environment === 'development') {
    require('dotenv').config();
}

/**
 * Define common app locals
 * @see https://expressjs.com/en/api.html#app.locals
 */
app.locals.environment = environment;
app.locals.DATE_FORMATS = {
    short: 'D MMMM, YYYY',
    full: 'dddd D MMMM YYYY',
    fullTimestamp: 'dddd D MMM YYYY (hh:mm a)'
};

const api = require('./apps/api');
const status = require('./apps/status');
const dashboard = require('./apps/dashboard');
const user = require('./apps/user');
const errors = require('./apps/errors');

const bodyParser = require('body-parser');
const auth = require('./middleware/auth');

/**
 * Configure Sentry client
 * @see https://docs.sentry.io/clients/node/config/
 * @see https://docs.sentry.io/clients/node/integrations/express/
 */
Raven.config(process.env.SENTRY_DSN, {
    logger: 'server',
    environment: environment,
    autoBreadcrumbs: true,
    dataCallback(data) {
        // Clear installed node_modules
        delete data.modules;
        // Clear POST data
        delete data.request.data;
        return data;
    }
}).install();

app.use(Raven.requestHandler());

/**
 * Configure views
 * - Configure Nunjucks
 * - Add custom filters
 */
function initViewEngine() {
    const templateEnv = nunjucks.configure('.', {
        autoescape: true,
        express: app,
        noCache: isDev === true,
        watch: isDev  === true
    });

    /**
     * View helper for formatting a date
     * @param {String} dateString
     * @param {String} format
     * @see https://momentjs.com/docs/#/displaying/format/
     */
    templateEnv.addFilter('formatDate', function(dateString, format) {
        return moment(dateString).tz("Europe/London").format(format);
    });

    /**
     * View helper to represent date as relative time
     * @param {String} dateString
     */
    templateEnv.addFilter('timeFromNow', function(dateString) {
        return moment(dateString).tz("Europe/London").fromNow();
    });

    app.set('view engine', 'njk').set('engineEnv', templateEnv);
}

initViewEngine();

/**
 * Global middleware
 */
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(auth.globalMiddleware());

/**
 * Mount routers
 */
app.use('/api', api);
app.use('/status', status);
app.use('/dashboard', dashboard);
app.use('/user', user);

/**
 * Global error handlers
 */
app.use(Raven.errorHandler());
app.use(errors.onError);

module.exports = app;

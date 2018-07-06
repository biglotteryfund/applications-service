'use strict';
const express = require('express');
const router = express.Router();
const logger = require('morgan');
const nunjucks = require('nunjucks');
const moment = require('moment');

const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    require('dotenv').config();
}
const passportMiddleware = require('./services/passport');
const sessionMiddleware = require('./services/session');
const bodyParserMiddleware = require('./services/bodyParser');

const app = express();
app.use(bodyParserMiddleware);
app.use(sessionMiddleware(app));
app.use(passportMiddleware());
app.use(logger('dev'));

const templateEnv = nunjucks.configure('.', {
    autoescape: true,
    express: app
});

/**
 * View helper for formatting a date
 * @param {String} dateString
 * @param {String} format
 * @see https://momentjs.com/docs/#/displaying/format/
 */
templateEnv.addFilter('formatDate', function(dateString, format) {
    return moment(dateString).format(format);
});

/**
 * View helper to represent date as relative time
 * @param {String} dateString
 */
templateEnv.addFilter('timeFromNow', function(dateString) {
    return moment(dateString).fromNow();
});

app.set('view engine', 'njk').set('engineEnv', templateEnv);

app.use('/', require('./apps/dashboard'));
// router.use('/api', require('./apps/api'));
app.use('/user', require('./apps/user'));

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    res.send({err, req, res});
});


module.exports = app;

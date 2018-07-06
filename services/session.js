'use strict';
const cookieParser = require('cookie-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const models = require('../models');

module.exports = function(app) {

    const store = new SequelizeStore({
        db: models.sequelize
    });

    // create sessions table
    store.sync();

    const secret = 'keyboard cat';
    const sessionConfig = {
        name: 'blf-applications',
        secret: secret,
        resave: true,
        saveUninitialized: false,
        store: store
    };

    return [cookieParser(secret), session(sessionConfig)];

};

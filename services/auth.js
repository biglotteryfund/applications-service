'use strict';
const passport = require('passport');
const config = require('config');

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        return res.redirect('/user');
    }
}

function authMiddleware(req, res, next) {
    passport.authenticate('azuread-openidconnect', {
        response: res,
        failureRedirect: '/user'
    })(req, res, next);
}

function authMiddlewareLogin(req, res, next) {
    console.log('login auth called');
    passport.authenticate('azuread-openidconnect', {
        response: res,
        resourceURL: config.get('auth.resourceURL'),
        failureRedirect: '/user'
    })(req, res, next);
}

module.exports = {
    ensureAuthenticated,
    authMiddleware,
    authMiddlewareLogin
};

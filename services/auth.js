'use strict';
const passport = require('passport');
const config = require('config');

function ensureAuthenticated(req, res, next) {
    console.log('mounted', req.path);
    if (req.user) {
        console.log('u r authed');
        return next();
    } else {
        console.log('not authed');
        return res.redirect('/user');
        // return res.send('ok');
        // return next();
    }
    // console.log(req.isAuthenticated());
    // return next();
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

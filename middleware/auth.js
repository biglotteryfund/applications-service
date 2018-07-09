'use strict';
const config = require('config');
const cookieParser = require('cookie-parser');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const passport = require('passport');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const models = require('../models');
const userService = require('../services/user');

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.session.redirectUrl = req.originalUrl;
        req.session.save(() => {
            return res.redirect('/user');
        });
    }
}

function authMiddleware(req, res, next) {
    passport.authenticate('azuread-openidconnect', {
        response: res,
        failureRedirect: '/user'
    })(req, res, next);
}

function authMiddlewareLogin(req, res, next) {
    passport.authenticate('azuread-openidconnect', {
        response: res,
        resourceURL: config.get('auth.resourceURL'),
        failureRedirect: '/user'
    })(req, res, next);
}

/**
 * Set up global auth middleware
 * - Initialise session
 * - Configure passport strategy
 */
function globalMiddleware() {
    const secret = process.env.SESSION_SECRET;

    const store = new SequelizeStore({
        db: models.sequelize
    });

    // create sessions table
    store.sync();

    const sessionConfig = {
        name: 'blf-applications',
        secret: secret,
        resave: true,
        saveUninitialized: false,
        store: store
    };

    const oidcConfig = {
        identityMetadata: config.get('auth.identityMetadata'),
        clientID: config.get('auth.clientID'),
        responseType: config.get('auth.responseType'),
        responseMode: config.get('auth.responseMode'),
        redirectUrl: config.get('auth.redirectUrl'),
        allowHttpForRedirectUrl: config.get('auth.allowHttpForRedirectUrl'),
        clientSecret: config.get('auth.clientSecret'),
        validateIssuer: config.get('auth.validateIssuer'),
        isB2C: config.get('auth.isB2C'),
        issuer: config.get('auth.issuer'),
        passReqToCallback: config.get('auth.passReqToCallback'),
        scope: config.get('auth.scope'),
        loggingLevel: config.get('auth.loggingLevel'),
        nonceLifetime: config.get('auth.nonceLifetime'),
        nonceMaxAmount: config.get('auth.nonceMaxAmount'),
        useCookieInsteadOfSession: config.get('auth.useCookieInsteadOfSession'),
        cookieEncryptionKeys: config.get('auth.cookieEncryptionKeys'),
        clockSkew: config.get('auth.clockSkew')
    };

    passport.use(
        new OIDCStrategy(oidcConfig, (iss, sub, profile, accessToken, refreshToken, done) => {
            if (!profile.oid) {
                return done(new Error('No oid found'), null);
            }
            // asynchronous verification, for effect...
            process.nextTick(() => {
                userService.findUser(profile.oid, (err, user) => {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        userService
                            .createUser(profile)
                            .then(() => {
                                return done(null, profile);
                            })
                            .catch(() => {
                                return done(null, user);
                            });
                    }
                    return done(null, user);
                });
            });
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.oid);
    });

    passport.deserializeUser((oid, done) => {
        userService.findUser(oid, (err, user) => {
            done(err, user);
        });
    });

    return [passport.initialize(), passport.session(), cookieParser(secret), session(sessionConfig)];
}

module.exports = {
    ensureAuthenticated,
    authMiddleware,
    authMiddlewareLogin,
    globalMiddleware
};

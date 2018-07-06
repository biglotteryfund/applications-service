'use strict';
const express = require('express');
const logger = require('morgan');
const path = require('path');
const nunjucks = require('nunjucks');
const config = require('config');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const SequelizeStore = require('connect-session-sequelize')(expressSession.Store);
const { Op } = require('sequelize');

const models = require('../../models');
const User = models.User;

const app = express();

const store = new SequelizeStore({
    db: models.sequelize
});

// create sessions table
store.sync();

app.use(logger('dev'));
app.use(cookieParser());
app.use(
    expressSession({
        name: 'blf-applications',
        secret: 'keyboard cat',
        resave: true,
        saveUninitialized: false,
        store: store
    })
);
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(passport.initialize());
app.use(passport.session());

const templateEnv = nunjucks.configure('.', {
    autoescape: true,
    express: app
});

app.set('view engine', 'njk').set('engineEnv', templateEnv);

const createUser = (user) => {
    return User.create({
        oid: user.oid,
        email: user.upn,
        given_name: user.name.givenName,
        family_name: user.name.familyName
    });
};

const findUser = (oid, cb) => {
    return User.findOne({
        where: {
            oid: {
                [Op.eq]: oid
            }
        }
    }).then(user => {
        // update last login date
        user.changed('updatedAt', true);
        return user.save().then(() => {
            return cb(null, user);
        });
    }).catch(() => {
        return cb(null, null);
    });
};

passport.serializeUser((user, done) => {
    done(null, user.oid);
});

passport.deserializeUser((oid, done) => {
    findUser(oid, (err, user) => {
        done(err, user);
    });
});

passport.use(
    new OIDCStrategy(
        {
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
        },
        (iss, sub, profile, accessToken, refreshToken, done) => {
            if (!profile.oid) {
                return done(new Error('No oid found'), null);
            }
            // asynchronous verification, for effect...
            process.nextTick(() => {
                findUser(profile.oid, (err, user) => {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        createUser(profile).then(() => {
                            return done(null, profile);
                        }).catch(dbErr => {
                            return done(null, user);
                        });
                    }
                    return done(null, user);
                });
            });
        }
    )
);

app.get('/', (req, res) => {
    res.render(path.resolve(__dirname, 'views/index'), {
        user: req.user
    });
});

app.get('/account', ensureAuthenticated, (req, res) => {
    res.render(path.resolve(__dirname, 'views/account'), {
        user: req.user
    });
});

app.get(
    '/login',
    (req, res, next) => {
        passport.authenticate('azuread-openidconnect', {
            response: res,
            resourceURL: config.resourceURL,
            failureRedirect: '/user'
        })(req, res, next);
    },
    (req, res) => {
        return res.redirect('/user');
    }
);

app.get(
    '/auth/openid/return',
    (req, res, next) => {
        passport.authenticate('azuread-openidconnect', {
            response: res,
            failureRedirect: '/user'
        })(req, res, next);
    },
    (req, res) => {
        return res.redirect('/user');
    }
);

app.post(
    '/auth/openid/return',
    (req, res, next) => {
        passport.authenticate('azuread-openidconnect', {
            response: res,
            failureRedirect: '/user'
        })(req, res, next);
    },
    (req, res) => {
        return res.redirect('/user');
    }
);

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        req.logOut();
        res.redirect(config.get('auth.destroySessionUrl'));
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/user/login');
}

module.exports = app;

'use strict';
const config = require('config');
const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const { Op } = require('sequelize');

const models = require('../models');
const User = models.User;

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

module.exports = function() {
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
                            }).catch(() => {
                                return done(null, user);
                            });
                        }
                        return done(null, user);
                    });
                });
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.oid);
    });

    passport.deserializeUser((oid, done) => {
        findUser(oid, (err, user) => {
            done(err, user);
        });
    });

    return [passport.initialize(), passport.session()];
};

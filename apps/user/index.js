'use strict';
const express = require('express');
const path = require('path');
const config = require('config');
const router = express.Router();

const auth = require('../../services/auth');

const noCache = (req, res, next) => {
    res.cacheControl = { noStore: true };
    next();
};

router.get('/', noCache, (req, res) => {
    res.render(path.resolve(__dirname, 'views/index'), {
        user: req.user
    });
});

router.get('/account', noCache, auth.ensureAuthenticated, (req, res) => {
    res.render(path.resolve(__dirname, 'views/account'), {
        user: req.user
    });
});

router.get('/login', noCache, auth.authMiddlewareLogin, (req, res) => {
    res.redirect('/user');
});

router.get('/auth/openid/return', noCache, auth.authMiddleware, (req, res) => {
    res.redirect('/user');
});

router.post('/auth/openid/return', noCache, auth.authMiddleware, (req, res) => {
    res.redirect('/user');
});

router.get('/logout', noCache, (req, res) => {
    req.session.destroy(() => {
        req.logOut();
        res.redirect(config.get('auth.destroySessionUrl'));
    });
});

module.exports = router;

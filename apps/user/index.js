'use strict';
const express = require('express');
const path = require('path');
const config = require('config');
const router = express.Router();

const auth = require('../../middleware/auth');

router.get('/', (req, res) => {
    // send the logged-in user to the place they wanted to get to
    if (req.isAuthenticated() && req.session.redirectUrl) {
        const redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl;
        req.session.save(() => {
            res.redirect(redirectUrl);
        });
    } else {
        res.render(path.resolve(__dirname, 'views/index'), {
            user: req.user,
            redirectUrl: req.query.redirectUrl
        });
    }
});

router.get('/account', auth.ensureAuthenticated, (req, res) => {
    res.render(path.resolve(__dirname, 'views/account'), {
        user: req.user
    });
});

router.get('/login', auth.authMiddlewareLogin, (req, res) => {
    res.redirect('/user');
});

router.get('/auth/openid/return', auth.authMiddleware, (req, res) => {
    res.redirect('/user');
});

router.post('/auth/openid/return', auth.authMiddleware, (req, res) => {
    res.redirect('/user');
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        req.logOut();
        res.redirect(config.get('auth.destroySessionUrl'));
    });
});

module.exports = router;

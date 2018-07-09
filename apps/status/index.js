'use strict';
const express = require('express');
const moment = require('moment');

const router = express.Router();

const LAUNCH_DATE = moment();

router.get('/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Cache-Control', 'no-store,no-cache,max-age=0');
    res.json({
        START_DATE: LAUNCH_DATE.format('dddd, MMMM Do YYYY, h:mm:ss a'),
        UPTIME: LAUNCH_DATE.toNow(true)
    });
});

module.exports = router;

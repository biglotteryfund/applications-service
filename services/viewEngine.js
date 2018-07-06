'use strict';
const nunjucks = require('nunjucks');
const moment = require('moment');

module.exports = function(app) {

    app.locals.DATE_FORMATS = {
        short: 'D MMMM, YYYY',
        full: 'dddd D MMMM YYYY',
        fullTimestamp: 'dddd D MMM YYYY (hh:mm a)'
    };

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

    return templateEnv;

};

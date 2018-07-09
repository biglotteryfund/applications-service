'use strict';
const path = require('path');

function onError(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    const { environment } = req.app.locals;

    res.locals.isBilingual = false;
    res.locals.status = err.status || 500;
    res.locals.error = environment === 'development' ? err : null;
    res.locals.message = err.message;
    res.locals.title = err.friendlyText ? err.friendlyText : 'Error';
    res.locals.sentry = res.sentry;

    res.status(res.locals.status).render(path.resolve(__dirname, 'views/error'));
}

module.exports = {
    onError
};

'use strict';
const express = require('express');
const logger = require('morgan');
const applicationsService = require('../../services/applications');

const app = express();

app.use(logger('dev'));
app.use(express.json());

function normaliseError(error) {
    let errorCode = {
        status: 400,
        code: 'APPLICATION-001',
        title: 'Unknown error'
    };

    switch (error.message) {
        case 'Validation error':
            errorCode = {
                status: 400,
                code: 'APPLICATION-002',
                title: 'Validation error'
            };
            break;
        default:
            break;
    }

    return errorCode;
}

app.post('/application/add', async function(req, res) {
    res.setHeader('Content-Type', 'application/vnd.api+json');

    try {
        const record = await applicationsService.storeApplication({
            formId: req.body.formId,
            shortCode: req.body.shortCode,
            applicationData: req.body.applicationData
        });

        res.json({
            data: {
                type: 'application',
                id: record.reference_id
            }
        });
    } catch (error) {
        const normalisedError = normaliseError(error);
        res.status(normalisedError.status).json({
            error: normalisedError
        });
    }
});

module.exports = app;

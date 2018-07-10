'use strict';
const { isEmpty } = require('lodash');
const express = require('express');

const applicationsService = require('../../services/applications');

const router = express.Router();

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
        case 'EmptyApplicationData':
            errorCode = {
                status: 400,
                code: 'APPLICATION-003',
                title: 'No application data'
            };
            break;
        default:
            break;
    }

    return errorCode;
}

router.post('/application/add', async function(req, res) {
    res.setHeader('Content-Type', 'application/vnd.api+json');

    try {
        if (isEmpty(req.body.applicationData)) {
            throw new Error('EmptyApplicationData');
        }

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

module.exports = router;

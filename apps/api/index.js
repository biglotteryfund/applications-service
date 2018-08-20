'use strict';
const { isEmpty } = require('lodash');
const express = require('express');

const applicationsService = require('../../services/applications');

const router = express.Router();

function normaliseError(rawError) {
    switch (rawError.message) {
        case 'Validation error':
            return {
                status: 400,
                code: 'APPLICATION-002',
                title: 'Validation error',
                errors: rawError.errors.map(e => {
                    delete e.instance;
                    return e;
                })
            }
        case 'EmptyApplicationData':
            return {
                status: 400,
                code: 'APPLICATION-003',
                title: 'No application data',
                message: rawError.message
            }
        default:
            return {
                status: 400,
                code: 'APPLICATION-001',
                title: 'Unknown error',
                message: rawError.message
            }
    }
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

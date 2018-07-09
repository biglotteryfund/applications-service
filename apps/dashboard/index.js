'use strict';
const express = require('express');
const router = express.Router();
const path = require('path');

const applicationService = require('../../services/applications');
const auth = require('../../services/auth');

router.route('/:formId?/:applicationId?').get(auth.ensureAuthenticated, async (req, res, next) => {
    try {
        const { formId, applicationId } = req.params;

        const recordsPerPage = req.query.perPage || 50;
        const currentPage = parseInt(req.query.page) || 1;

        const viewData = {
            formId,
            forms: [],
            applications: [],
            formTitle: null,
            applicationData: null
        };

        if (applicationId) {
            // look up a specific application
            viewData.applicationData = await applicationService.getApplicationById(applicationId);

            if (!viewData.applicationData) {
                return next();
            }

            viewData.formTitle = viewData.applicationData.formTitle;
        } else if (formId) {
            // get applications for a given form
            const paginatedApplications = await applicationService.getApplicationsByForm(formId, recordsPerPage, currentPage);
            viewData.applications = paginatedApplications.applications;
            viewData.totalApplications = paginatedApplications.totalApplications;

            viewData.pagination = {
                currentPage: currentPage,
                perPage: recordsPerPage,
                totalPages: paginatedApplications.numPages,
            };

            if (viewData.applications.length < 1) {
                return next();
            }

            viewData.formTitle = viewData.applications[0].formTitle;
        } else {
            // fetch all forms instead for a list
            viewData.formTitle = 'All online forms';
            viewData.forms = await applicationService.getAvailableForms();
        }

        res.render(path.resolve(__dirname, 'views/dashboard'), viewData);
    } catch (error) {
        next(error);
    }
});

module.exports = router;

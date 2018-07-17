'use strict';
const express = require('express');
const router = express.Router();
const path = require('path');
const { isEmpty } = require('lodash');

const auth = require('../../middleware/auth');
const applicationService = require('../../services/applications');
const { summariseApplications, canDownload, createSpreadsheet } = require('./spreadsheet');

function getCleanAbsoluteUrl(req) {
    const headerProtocol = req.get('X-Forwarded-Proto');
    const protocol = headerProtocol ? headerProtocol : req.protocol;
    return `${protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
}

router.route('/search/:formId').post(auth.ensureAuthenticated, async (req, res, next) => {
    function redirectToError() {
        req.session.noResultsFound = true;
        req.session.save(() => {
            return res.redirect(`/dashboard/${req.params.formId}`);
        });
    }

    if (isEmpty(req.body.searchTerm)) {
        return redirectToError();
    }

    let application = await applicationService.searchApplicationsByForm(req.params.formId, req.body.searchTerm);

    if (!application) {
        return redirectToError();
    } else {
        return res.redirect(`/dashboard/${req.params.formId}/${application.reference_id}`);
    }
});

router.route('/:formId?/:applicationId?').get(auth.ensureAuthenticated, async (req, res, next) => {
    try {
        const { formId, applicationId } = req.params;

        const recordsPerPage = req.query.perPage || 50;
        const currentPage = parseInt(req.query.page) || 1;

        // reset search param (if found)
        const searchFailed = req.session.noResultsFound;
        delete req.session.noResultsFound;

        const viewData = {
            formId,
            forms: [],
            applications: [],
            formTitle: null,
            applicationData: null,
            searchFailed: searchFailed
        };

        if (applicationId) {
            // look up a specific application
            viewData.applicationData = await applicationService.getApplicationById(applicationId);

            if (!viewData.applicationData) {
                return next();
            }

            viewData.formTitle = viewData.applicationData.formTitle;
        } else if (formId) {
            if (recordsPerPage === 'all') {
                viewData.applications = await applicationService.getAllApplicationsByForm(formId);
            } else {
                // get applications for a given form
                const paginatedApplications = await applicationService.getPaginatedApplicationsByForm(
                    formId,
                    recordsPerPage,
                    currentPage
                );
                viewData.applications = paginatedApplications.applications;
                viewData.totalApplications = paginatedApplications.totalApplications;

                viewData.pagination = {
                    currentPage: currentPage,
                    perPage: recordsPerPage,
                    totalPages: paginatedApplications.numPages
                };
            }

            if (viewData.applications.length < 1) {
                return next();
            }

            viewData.formTitle = viewData.applications[0].formTitle;

            /**
             * Allow people to download a summary spreadsheet of all application
             */
            viewData.showDownloadLink = canDownload(formId);
            if (viewData.showDownloadLink && req.query.download) {
                const allApplications = await applicationService.getAllApplicationsByForm(formId);
                const summary = summariseApplications({
                    formId: formId,
                    baseUrl: getCleanAbsoluteUrl(req),
                    applications: allApplications
                });

                const buffer = createSpreadsheet(summary);
                res.setHeader('Content-Disposition', `attachment; filename=${formId}.xlsx`);
                return res.status(200).send(buffer);
            }
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

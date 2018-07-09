'use strict';
const hash = require('object-hash');
const { Op, fn } = require('sequelize');

const { Application } = require('../models');

function getReferenceId(shortCode, applicationData) {
    return `${shortCode}-${hash
        .sha1(applicationData)
        .slice(0, 6)
        .toUpperCase()}`;
}

function storeApplication({ formId, shortCode, applicationData }) {
    return Application.create({
        form_id: formId,
        reference_id: getReferenceId(shortCode, applicationData),
        application_data: applicationData
    });
}

function getAvailableForms() {
    return Application.findAll({
        order: [['form_id', 'ASC']],
        group: ['form_id'],
        attributes: ['form_id', [fn('COUNT', 'id'), 'count']]
    });
}

function getApplicationsByForm(formId, recordsPerPage, currentPage = 1) {
    return Application.findAndCountAll().then(applications => {
        let pages = Math.ceil(applications.count / recordsPerPage);
        let query = {
            order: [['updatedAt', 'DESC']],
            where: {
                form_id: {
                    [Op.eq]: formId
                }
            }
        };

        if (recordsPerPage !== 'all') {
            recordsPerPage = parseInt(recordsPerPage);
            query.offset = recordsPerPage * (currentPage - 1);
            query.limit = recordsPerPage;
        }

        return Application.findAll(query).then(applicationPage => {
            return {
                applications: applicationPage,
                numPages: pages,
                totalApplications: applications.count
            }
        });
    });
}

function getApplicationById(applicationId) {
    return Application.findOne({
        where: {
            reference_id: {
                [Op.eq]: applicationId
            }
        }
    });
}

module.exports = {
    getReferenceId,
    storeApplication,
    getApplicationsByForm,
    getApplicationById,
    getAvailableForms
};

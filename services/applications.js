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

async function getAllApplicationsByForm(formId) {
    return Application.findAll({
        order: [['updatedAt', 'DESC']],
        where: { form_id: { [Op.eq]: formId } }
    })
}

async function getPaginatedApplicationsByForm(formId, recordsPerPage = 50, currentPage = 1) {
    recordsPerPage = parseInt(recordsPerPage);

    const results = await Application.findAndCountAll({
        order: [['updatedAt', 'DESC']],
        where: { form_id: { [Op.eq]: formId } },
        offset: recordsPerPage * (currentPage - 1),
        limit: recordsPerPage
    });

    return {
        applications: results.rows,
        numPages: Math.ceil(results.count / recordsPerPage),
        totalApplications: results.count
    };
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

function searchApplicationsByForm(formId, searchTerm) {
    return Application.findOne({
        where: {
            form_id: {
                [Op.eq]: formId
            },
            reference_id: {
                [Op.eq]: searchTerm,
            }
        }
    });
}

module.exports = {
    getAllApplicationsByForm,
    getApplicationById,
    getAvailableForms,
    getPaginatedApplicationsByForm,
    getReferenceId,
    storeApplication,
    searchApplicationsByForm
};

'use strict';
const XLSX = require('xlsx');
const { flatMap, fromPairs } = require('lodash');

function flattenApplicationData(application) {
    return fromPairs(
        flatMap(application.application_data, step => {
            return flatMap(step.fieldsets, fieldset => {
                return fieldset.fields.map(field => [field.name, field.value]);
            });
        })
    );
}

function getTransformer(formId) {
    switch (formId) {
        case 'building-connections-fund':
            return function(fields) {
                return {
                    'Organisation name': fields['organisation-name'],
                    'Main contact: First name': fields['first-name'],
                    'Main contact: Last name': fields['last-name'],
                    'Address: street': fields['address-building-street'],
                    'Address: town or city': fields['address-town-city'],
                    'Address: county': fields['address-county'],
                    'Address: postcode': fields['address-postcode'],
                    'Project region': fields['location'],
                    'Project location': fields['project-location'],
                    'Total amount requested': fields['project-budget-total'],
                    'Project start date': '',
                    'Length of funding': '',
                    'Theme 1': '',
                    'Theme 2': '',
                    'Theme 3': '',
                    'Assessor name': '',
                    Recommendation: ''
                };
            };
        default:
            return null;
    }
}

function summariseApplications({ baseUrl, formId, applications }) {
    const transformer = getTransformer(formId);

    if (transformer) {
        return applications.map(application => {
            const linkUrl = `${baseUrl}/${application.reference_id}`;
            const coreFields = {
                'Reference ID': {
                    f: `HYPERLINK("${linkUrl}", "${application.reference_id}")`
                },
                'Date submitted': {
                    t: 'd',
                    v: new Date(application.createdAt)
                }
            };

            const customFields = transformer(flattenApplicationData(application));

            return Object.assign(coreFields, customFields);
        });
    } else {
        return [];
    }
}

function canDownload(formId) {
    const transformer = getTransformer(formId);
    return transformer !== null;
}

/**
 * Create spreadsheet
 *
 * @param {Array} array of JSON data for rows
 * @returns {Buffer} xslx file buffer
 */
function createSpreadsheet(rows) {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');

    return XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx'
    });
}

module.exports = {
    summariseApplications,
    canDownload,
    createSpreadsheet
};

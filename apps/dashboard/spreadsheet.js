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

function summariseApplications({ baseUrl, applications }) {
    return applications.map(application => {
        const fields = flattenApplicationData(application);

        return {
            'Reference ID': application.form_id,
            'Full application URL': `${baseUrl}/${application.reference_id}`,
            'Project location': fields['location'],
            'Organisation Name': fields['organisation-name'],
            'Address: Street': fields['address-building-street'],
            'Address: Town or City': fields['address-town-city'],
            'Address: County': fields['address-county'],
            'Address: Postcode': fields['address-postcode']
        };
    });
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
    createSpreadsheet
};

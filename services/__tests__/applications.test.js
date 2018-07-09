/* eslint-env jest */
'use strict';
process.env.DB_CONNECTION_URI = 'sqlite://:memory';

const models = require('../../models');
const applicationsService = require('../applications');
const faker = require('faker');

function createMock() {
    return [
        {
            name: 'Step 1',
            fieldsets: [
                {
                    legend: 'Cow colour',
                    fields: [
                        {
                            label: 'How now brown cow?',
                            name: 'how-now-brown-cow',
                            value: faker.lorem.words(20)
                        }
                    ]
                }
            ]
        },
        {
            name: 'Step 2',
            fieldsets: [
                {
                    legend: 'Contact details',
                    fields: [
                        { label: 'First name', name: 'first-name', value: 'Anne' },
                        { label: 'Last name', name: 'last-name', value: 'Example' },
                        { label: 'Email address', name: 'email', value: faker.internet.email() },
                        { label: 'Phone number', name: 'phone-number', value: '5555555' }
                    ]
                }
            ]
        }
    ];
}

beforeAll(async function() {
    await models.sequelize.sync();
    return Promise.all([
        applicationsService.storeApplication({
            formId: 'test-form-1',
            shortCode: 'TEST-1',
            applicationData: createMock()
        }),
        applicationsService.storeApplication({
            formId: 'test-form-2',
            shortCode: 'TEST-2',
            applicationData: createMock()
        })
    ]);
});

test('should reference short id', function() {
    const referenceId = applicationsService.getReferenceId('TEST', { some: 'data' });
    expect(referenceId).toEqual('TEST-58ED45');
});

test('should get all available forms', async function() {
    const availableForms = await applicationsService.getAvailableForms();
    expect(availableForms).toHaveLength(2);
});

test('should get all applications for a given form', async function() {
    const response = await applicationsService.getApplicationsByForm('test-form-1');
    expect(response.applications).toHaveLength(1);
});

test('should get an application by its id', async function() {
    const mockApplicationData = createMock();
    const record = await applicationsService.storeApplication({
        formId: 'test-form-1',
        shortCode: 'TEST-1',
        applicationData: mockApplicationData
    });
    const foundRecord = await applicationsService.getApplicationById(record.reference_id);
    expect(foundRecord.application_data).toMatchObject(mockApplicationData);
});

/* eslint-env jest */
'use strict';
process.env.DB_CONNECTION_URI = 'sqlite://:memory';

const models = require('../../models');
const userService = require('../user');
const faker = require('faker');

function mockUser() {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    return {
        oid: faker.random.uuid(),
        upn: email,
        name: {
            givenName: firstName,
            familyName: lastName
        }
    }
}

beforeAll(async function() {
    await models.sequelize.sync();
    return userService.createUser(mockUser());
});

test('create and find a user', async function(done) {
    const mock = mockUser();
    const record = await userService.createUser(mock);
    expect(record.id).toBe(2);
    expect(record.oid).toBe(mock.oid);

    userService.findUser(mock.oid, function(err, user) {
        expect(user.email).toBe(mock.upn);
        expect(user.given_name).toBe(mock.name.givenName);
        done();
    });
});

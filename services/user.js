'use strict';
const { Op } = require('sequelize');
const { User } = require('../models');

const createUser = (user) => {
    return User.create({
        oid: user.oid,
        email: user.upn,
        given_name: user.name.givenName,
        family_name: user.name.familyName
    });
};

const findUser = (oid, cb) => {
    return User.findOne({
        where: {
            oid: {
                [Op.eq]: oid
            }
        }
    }).then(user => {
        // update last login date
        user.changed('updatedAt', true);
        return user.save().then(() => {
            return cb(null, user);
        });
    }).catch(() => {
        return cb(null, null);
    });
};

module.exports = {
    createUser,
    findUser
};

'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
        'User',
        {
            oid: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false
            },
            given_name: {
                type: DataTypes.STRING,
                allowNull: true
            },
            family_name: {
                type: DataTypes.STRING,
                allowNull: true
            }
        },
        {
            getterMethods: {
                fullName() {
                    return `${this.given_name} ${this.family_name}`;
                }
            }
        }
    );
};

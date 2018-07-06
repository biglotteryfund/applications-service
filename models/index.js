'use strict';
const { startsWith } = require('lodash');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const debug = require('debug')('applications-service:models');

const connectionUri = process.env.DB_CONNECTION_URI;
const useSqlite = process.env.NODE_ENV !== 'production' && startsWith(connectionUri, 'sqlite://');
const dialect = useSqlite ? 'sqlite' : 'mysql';

debug(`Using ${dialect} database`);

const sequelize = new Sequelize(connectionUri, {
    logging: false,
    dialect: dialect,
    define: {
        charset: 'utf8mb4',
        dialectOptions: {
            collate: 'utf8mb4_general_ci'
        }
    },
    operatorsAliases: false,
    pool: {
        max: 5,
        min: 1,
        idle: 10000
    }
});

const db = {};
const basename = path.basename(__filename);
fs.readdirSync(__dirname)
    .filter(file => {
        return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
    })
    .forEach(file => {
        let model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

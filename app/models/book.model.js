const sequel = require('sequelize');
const mySequel = require('../utils/sequelize.util');
const account = require('./account.model');

const book = mySequel.define('book', {
    id: {
        type: sequel.BIGINT(20),
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    author: {
        type: sequel.STRING(128),
        allowNull: false,
    },
    title: {
        type: sequel.STRING(1024),
        allowNull: false,
    },
    parts: {
        type: sequel.INTEGER,
        allowNull: false,
    },
    category: {
        type: sequel.BIGINT(20),
        allowNull: false,
    },
    account_id: {
        type: sequel.INTEGER(11),
        allowNull: true,
    },
    created_by: {
        type: sequel.BIGINT(20),
        allowNull: false,
        references: {
            model: account,
            key: 'id',
        },
    },
    updated_by: {
        type: sequel.BIGINT(20),
        allowNull: false,
        references: {
            model: account,
            key: 'id',
        },
    },
    created_at: {
        type: sequel.DATE,
        allowNull: true,
        defaultValue: sequel.NOW
    },
    updated_at: {
        type: sequel.DATE,
        allowNull: true,
        defaultValue: sequel.NOW
    },
}, {
    underscored: false,
    timestamps: false,
    updatedAt: false,
    createdAt: false,
    includeDeleted: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'tbl_book',
});

module.exports = book;

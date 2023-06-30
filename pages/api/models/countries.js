const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const Countries= sequelize.define('countries', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    country_name: DataTypes.STRING,
}, {
    tableName: 'countries',
    paranoid: true,
    force: false,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
});

module.exports = Countries;

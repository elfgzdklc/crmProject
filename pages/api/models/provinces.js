const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const Provinces= sequelize.define('provinces', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    country_id : DataTypes.INTEGER,
    province_name : DataTypes.STRING,
    number_plate : DataTypes.STRING
}, {
    tableName: 'provinces',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    force: false,
});

module.exports = Provinces;

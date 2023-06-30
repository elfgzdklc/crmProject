const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const District = sequelize.define('district', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    province_id : DataTypes.INTEGER,
    district_name : DataTypes.STRING,
}, {
    tableName: 'district',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    force: false
});

module.exports = District;

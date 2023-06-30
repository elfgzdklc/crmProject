const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const Settings = sequelize.define('settings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    deleted_id: DataTypes.INTEGER,
    logo: DataTypes.STRING,
    signature: DataTypes.STRING,
    favicon: DataTypes.STRING,
    favicon32: DataTypes.STRING,
    first_phone: DataTypes.STRING,
    second_phone: DataTypes.STRING,
    email: DataTypes.STRING,
    address: DataTypes.STRING,
    trade_name: DataTypes.STRING,
    meeting_time: DataTypes.STRING,
}, {
    tableName: 'settings',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
});

module.exports = Settings;

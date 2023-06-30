const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const Logs = sequelize.define('logs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    action: DataTypes.STRING,
    ip_address: DataTypes.STRING,
}, {
    tableName: 'logs',
    paranoid: true,
    force: false,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
});

module.exports = Logs;

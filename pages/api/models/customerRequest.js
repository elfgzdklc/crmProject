const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const customerRequest = sequelize.define('customerRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    deleted_id: DataTypes.INTEGER,
    request_user_id: DataTypes.INTEGER,
    assigned_user_id: DataTypes.INTEGER,
    customer_id: DataTypes.INTEGER,
    customer_type: DataTypes.STRING,
    description: DataTypes.STRING,
    status: DataTypes.INTEGER,
    accept_user_id: DataTypes.INTEGER,
    rejection_user_id: DataTypes.INTEGER,
    accept_time: DataTypes.DATE,
    rejection_time: DataTypes.DATE,
}, {
    tableName: 'customer_request',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    force: false,
});

module.exports = customerRequest;

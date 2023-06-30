const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const CustomerToUser = sequelize.define('customerToUser', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    deleted_id: DataTypes.INTEGER,
    appointing_user_id: DataTypes.INTEGER,
    assigned_user_id: DataTypes.INTEGER,
    customer_id: DataTypes.INTEGER,
    customer_type: DataTypes.STRING,
    status: DataTypes.STRING,
}, {
    tableName: 'customer_to_user',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    force: false,
});

module.exports = CustomerToUser;

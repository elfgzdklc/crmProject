const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const CustomerOfficial = sequelize.define('customerOfficial', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    deleted_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    name: DataTypes.STRING,
    surname: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
}, {
    tableName: 'customer_official',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    force: false,
});

module.exports = CustomerOfficial;

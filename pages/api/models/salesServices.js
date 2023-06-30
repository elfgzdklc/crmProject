const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const SalesServices = sequelize.define('salesServices', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    deleted_id: DataTypes.INTEGER,
    invoice_no: DataTypes.STRING,
    customer_trade_name: DataTypes.STRING,
    description: DataTypes.STRING,
    file: DataTypes.STRING,
    solution: DataTypes.STRING,
    problem: DataTypes.STRING,
    product: DataTypes.STRING,
    sales_owner: DataTypes.STRING,
    date: DataTypes.DATE,
}, {
    tableName: 'sales_services',
    paranoid: true,
    force: false,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
});

module.exports = SalesServices;

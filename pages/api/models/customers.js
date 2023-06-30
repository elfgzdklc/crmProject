const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const Customers = sequelize.define('customers', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    deleted_id: DataTypes.INTEGER,
    category_id: DataTypes.INTEGER,
    type: DataTypes.TINYINT,
    status: DataTypes.TINYINT,
    customer_code: DataTypes.STRING,
    trade_name: DataTypes.STRING,
    tax_number: DataTypes.STRING,
    last_meeting_time: DataTypes.DATE,
    tax_administration: DataTypes.STRING,
}, {
    tableName: 'customers',
    paranoid: true,
    force: false,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
});

module.exports = Customers;

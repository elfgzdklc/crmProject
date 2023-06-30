const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const Purchases = sequelize.define('purchases', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    document_number: DataTypes.STRING,
    purchase_code: DataTypes.STRING,
    customer_id: DataTypes.INTEGER,
    customer_trade_name: DataTypes.STRING,
    purchase_date: DataTypes.DATE,
    delivery_date: DataTypes.DATE,
    maturity_date: DataTypes.DATE,
    invoice_address: DataTypes.STRING,
    delivery_time: DataTypes.STRING,
    maturity_time: DataTypes.STRING,
    subject: DataTypes.STRING,
    subtotal: DataTypes.DECIMAL,
    vat_total: DataTypes.DECIMAL,
    discount_total: DataTypes.DECIMAL,
    overall_total: DataTypes.DECIMAL,
    shipping_cost: DataTypes.DECIMAL,
}, {
    tableName: 'purchases',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    force: false,
});

module.exports = Purchases;

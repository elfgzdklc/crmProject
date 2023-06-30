const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const SalesDetails = sequelize.define('salesDetails', {
    sales_id:DataTypes.INTEGER,
    product_id:DataTypes.INTEGER,
    product_name:DataTypes.STRING,
    quantity:DataTypes.INTEGER,
    availability:DataTypes.INTEGER,
    unit:DataTypes.STRING,
    unit_price:DataTypes.DECIMAL,
    currency_unit:DataTypes.STRING,
    vat:DataTypes.DECIMAL,
    vat_amount:DataTypes.DECIMAL,
    discount:DataTypes.DECIMAL,
    discount_type:DataTypes.STRING,
    discount_amount:DataTypes.DECIMAL,
    subtotal:DataTypes.DECIMAL,
    total:DataTypes.DECIMAL,
    description:DataTypes.STRING,
    packaging:DataTypes.STRING,
}, {
    tableName: 'sales_details',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    force: false,
});

module.exports = SalesDetails;

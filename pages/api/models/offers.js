const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const Offers = sequelize.define('offers', {
    user_id:DataTypes.INTEGER,
    bank_id:DataTypes.INTEGER,
    offer_code:DataTypes.STRING,
    customer_id:DataTypes.INTEGER,
    customer_trade_name:DataTypes.STRING,
    offer_date:DataTypes.DATE,
    end_date:DataTypes.DATE,
    maturity_date:DataTypes.DATE,
    invoice_address:DataTypes.INTEGER,
    shipment_address:DataTypes.INTEGER,
    delivery_time:DataTypes.STRING,
    maturity_time:DataTypes.STRING,
    subject:DataTypes.STRING,
    transport:DataTypes.STRING,
    currency_unit:DataTypes.STRING,
    subtotal:DataTypes.DECIMAL,
    vat_total:DataTypes.DECIMAL,
    discount_total:DataTypes.DECIMAL,
    shipping_cost:DataTypes.DECIMAL,
    shipping_percent:DataTypes.DECIMAL,
    shipping_percentage_amount:DataTypes.DECIMAL,
    shipping_total_cost:DataTypes.DECIMAL,
    overall_total:DataTypes.DECIMAL,
    payment:DataTypes.STRING,
    shipped_by:DataTypes.STRING,
    delivery_term:DataTypes.STRING,
    origin:DataTypes.STRING,
    number_of_packages:DataTypes.STRING,
    type_of_packaging:DataTypes.STRING,
    validity:DataTypes.STRING,
    status:DataTypes.INTEGER,
    sales_status:DataTypes.INTEGER,
    revised:DataTypes.INTEGER,
    revised_code:DataTypes.STRING,
    foreign_currency:DataTypes.STRING
}, {
    tableName: 'offers',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    force: false,
});

module.exports = Offers;

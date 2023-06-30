const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const CustomerContacts = sequelize.define('customerContacts', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    deleted_id: DataTypes.INTEGER,
    customer_id: DataTypes.INTEGER,
    country_id: DataTypes.INTEGER,
    province_id: DataTypes.INTEGER,
    district_id: DataTypes.INTEGER,
    country_name: DataTypes.STRING,
    province_name: DataTypes.STRING,
    district_name: DataTypes.STRING,
    address: DataTypes.STRING,
    zip_code: DataTypes.STRING,
    address_type: DataTypes.TINYINT
}, {
    tableName: 'customer_contacts',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    force: false,
});

module.exports = CustomerContacts;

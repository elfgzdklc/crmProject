const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const CustomerCategories= sequelize.define('customerCategories', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    deleted_id: DataTypes.INTEGER,
    category_name: DataTypes.STRING,
}, {
    tableName: 'customer_categories',
    paranoid: true,
    force: false,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
});

module.exports = CustomerCategories;

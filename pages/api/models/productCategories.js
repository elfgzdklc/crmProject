const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const ProductCategories = sequelize.define('product_categories', {
    user_id:DataTypes.INTEGER,
    deleted_id:DataTypes.INTEGER,
    category_name:DataTypes.STRING
}, {
    tableName: 'product_categories',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    force: false,
});

module.exports = ProductCategories;

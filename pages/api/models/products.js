const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const Products = sequelize.define('products', {
    user_id:DataTypes.INTEGER,
    brand_id:DataTypes.INTEGER,
    product_category_id:DataTypes.INTEGER,
    deleted_id:DataTypes.INTEGER,
    product_code:DataTypes.STRING,
    product_name:DataTypes.STRING,
    product_desc:DataTypes.STRING,
    product_image:DataTypes.STRING,
    stock:DataTypes.INTEGER,
    desi:DataTypes.DECIMAL,
    kilogram:DataTypes.DECIMAL,
    price:DataTypes.DECIMAL,
    sale_price:DataTypes.DECIMAL,
}, {
    tableName: 'products',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    force: false,
});

module.exports = Products;

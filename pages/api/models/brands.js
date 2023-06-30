const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const Brands = sequelize.define('brands', {
    user_id:DataTypes.INTEGER,
    deleted_id:DataTypes.INTEGER,
    brand_name:DataTypes.STRING,
}, {
    tableName: 'brands',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    force: false,
});

module.exports = Brands;

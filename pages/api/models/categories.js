const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const Categories = sequelize.define('categories', {
    user_id:DataTypes.INTEGER,
    deleted_id:DataTypes.INTEGER,
    type:DataTypes.STRING,
    category_name:DataTypes.STRING
}, {
    tableName: 'categories',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    force: false,
});

module.exports = Categories;

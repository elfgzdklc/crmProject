const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const CustomerToOfficial = sequelize.define('customerToOfficial', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    deleted_id: DataTypes.INTEGER,
    customer_id: DataTypes.INTEGER,
    official_id: DataTypes.INTEGER,
}, {
    tableName: 'customer_to_official',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    force: false,
});

module.exports = CustomerToOfficial;

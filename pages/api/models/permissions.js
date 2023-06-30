const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const Permissions = sequelize.define('permissions', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    deleted_id: DataTypes.INTEGER,
    permission_name: DataTypes.STRING,
}, {
    tableName: 'permissions',
    paranoid: true,
    force: false,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
});

module.exports = Permissions;

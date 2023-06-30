const {DataTypes} = require('sequelize');
const sequelize = require('../../api/db');
const Department = sequelize.define('departments', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    department_name: DataTypes.STRING,
    deleted_id: DataTypes.INTEGER,
}, {
    tableName: 'departments',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    force: false,
});
module.exports = Department;
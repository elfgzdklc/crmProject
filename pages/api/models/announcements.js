const {DataTypes} = require('sequelize');
const sequelize = require('../../api/db');
const Announcements = sequelize.define('announcements', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    deleted_id: DataTypes.INTEGER,
    department_id: DataTypes.INTEGER,
    department_name: DataTypes.STRING,
    subject: DataTypes.STRING,
    message: DataTypes.STRING,
    reading_time: DataTypes.DATE,
}, {
    tableName: 'announcements',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    force: false,
});

module.exports = Announcements;
const {DataTypes} = require('sequelize');
const sequelize = require('../../api/db');
const Events = sequelize.define('events', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    meeting_id: DataTypes.INTEGER,
    deleted_id: DataTypes.INTEGER,
    importanceEvent: DataTypes.INTEGER,
    read: DataTypes.INTEGER,
    title: DataTypes.STRING,
    eventBg: DataTypes.STRING,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
}, {
    tableName: 'events',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    force: false,
});
module.exports = Events;
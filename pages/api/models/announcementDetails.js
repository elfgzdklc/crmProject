const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db")
const AnnouncementDetails = sequelize.define('announcementDetails', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        announcement_id: DataTypes.INTEGER,
        deleted_id: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        status: DataTypes.INTEGER,
        reading_time: DataTypes.DATE,
    },
    {
        tableName: 'announcement_details',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        paranoid: true,
        force: false,
    });
module.exports = AnnouncementDetails;
const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const CustomerMeetings = sequelize.define('customerMeetings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    customer_id: DataTypes.INTEGER,
    meeting_code: DataTypes.STRING,
    meeting_subject: DataTypes.STRING,
    meeting_type: DataTypes.STRING,
    meeting_description: DataTypes.STRING,
    meeting_user_id: DataTypes.INTEGER,
    meeting_user_name: DataTypes.STRING,
    meeting_file: DataTypes.STRING,
}, {
    tableName: 'customer_meetings',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    force: false,
});

module.exports = CustomerMeetings;

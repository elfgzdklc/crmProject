const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const Users = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    deleted_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    permission_id:DataTypes.INTEGER,
    parent_id:DataTypes.INTEGER,
    department_id:DataTypes.INTEGER,
    user_liable:DataTypes.INTEGER,
    title:DataTypes.STRING,
    name:DataTypes.STRING,
    surname:DataTypes.STRING,
    phone:DataTypes.STRING,
    password:DataTypes.STRING,
    identity_number:DataTypes.STRING,
    email:DataTypes.STRING,
    avatar:DataTypes.STRING,
    email_verify_code:DataTypes.STRING,
    email_verify_action:DataTypes.DATE,
    personel_code:DataTypes.STRING
}, {
    tableName: 'users',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    force: false,
});

module.exports = Users;

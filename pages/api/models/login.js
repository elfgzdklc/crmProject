const {DataTypes} = require("sequelize");
const sequelize = require("../db");
const Login = sequelize.define('login', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    permission_id: DataTypes.INTEGER,
    parent_id: DataTypes.INTEGER,
    department_id : DataTypes.INTEGER,
    title : DataTypes.STRING,
    name : DataTypes.STRING,
    surname : DataTypes.STRING,
    phone : DataTypes.STRING,
    password : DataTypes.STRING,
    identity_number : DataTypes.STRING,
    email : DataTypes.STRING,
    email_verify_code : DataTypes.STRING,
    email_verify_action : DataTypes.DATE
}, {
    tableName: 'users',
    paranoid: true,
    force: false,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
});

module.exports = Login;

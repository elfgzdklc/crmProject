const {DataTypes} = require("sequelize");
const sequelize = require("../db");
const Sample = sequelize.define('staff', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    name_surname: DataTypes.STRING,
    start_date_of_work: DataTypes.STRING,
    email: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    mission: DataTypes.STRING,
    name_of_the_bank: DataTypes.STRING,
    iban_no: DataTypes.STRING,
    identity: DataTypes.STRING,
    employee_picture: DataTypes.STRING
}, {
    tableName: 'staff',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
});

module.exports = Sample;

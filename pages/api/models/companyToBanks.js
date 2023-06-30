const {DataTypes} = require("sequelize");
const sequelize = require("../../api/db");
const CompanyToBanks = sequelize.define('companyToBanks', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    deleted_id: DataTypes.INTEGER,
    bank_name: DataTypes.STRING,
    bank_branch: DataTypes.STRING,
    swift_code: DataTypes.STRING,
    usd_iban_no: DataTypes.STRING,
    euro_iban_no: DataTypes.STRING,
}, {
    tableName: 'company_to_banks',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
});

module.exports = CompanyToBanks;

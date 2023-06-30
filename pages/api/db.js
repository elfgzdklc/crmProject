const {Sequelize} = require("sequelize");
const sequelize = new Sequelize('crm', 'crm', '', {
    host: 'localhost:3000',
    dialect: "mysql"
});
module.exports = sequelize;

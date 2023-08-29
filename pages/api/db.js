const {Sequelize} = require("sequelize");

// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//     pool: {
//         max: 5,
//         min: 0,
//         acquire: 30000,
//         idle: 10000,
//     },
// });
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});
sequelize
    .authenticate()
    .then(() => {
        console.log('Veritabanına başarıyla bağlandı.');
    })
    .catch(err => {
        console.error('Veritabanı bağlantısı başarısız:', err);
    });

module.exports = sequelize;


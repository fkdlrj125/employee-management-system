require('dotenv').config();

// backend/config/sequelize.js
const { Sequelize } = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'employee_management_system',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    timezone: '+09:00',
    logging: false,
  },
  // 필요시 test, production 환경도 추가
};

const dbConfig = config[env];
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
sequelize.options.logging = console.log;

module.exports = sequelize;

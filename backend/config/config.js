// backend/config/sequelize.js
module.exports = {
  development: {
    username: process.env.DB_USER || 'user',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'employee_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    dialect: 'mysql',
    timezone: '+09:00',
    logging: false,
  },
  // 필요시 test, production 환경도 추가
};

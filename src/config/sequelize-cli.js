require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
  test: {
    username: process.env.TEST_DB_USER || process.env.DB_USER,
    password: process.env.TEST_DB_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.TEST_DB_NAME || 'testdb',
    host: process.env.TEST_DB_HOST || process.env.DB_HOST,
    port: parseInt(process.env.TEST_DB_PORT || process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
};

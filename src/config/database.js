const { Sequelize } = require('sequelize');
const logger = require('./logger');

const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
requiredVars.forEach((v) => {
  if (!process.env[v]) {
    throw new Error(`[FATAL] Variable d'environnement manquante : ${v}`);
  }
});

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 50,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 10,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      charset: 'utf8mb4',
      timezone: '+00:00',
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      underscored: false,
      paranoid: true,
    },
  }
);

const connectDB = async () => {
  await sequelize.authenticate();
  logger.info('Connexion MySQL établie avec succès');
};

module.exports = { sequelize, connectDB };

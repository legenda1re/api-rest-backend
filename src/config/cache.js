const { createClient } = require('redis');
const logger = require('./logger');

let redisClient = null;

const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    throw new Error("[FATAL] Variable d'environnement manquante : REDIS_URL");
  }

  redisClient = createClient({ url: process.env.REDIS_URL });

  redisClient.on('error', (err) => logger.error('Erreur Redis', { err: err.message }));
  redisClient.on('reconnecting', () => logger.warn('Redis : reconnexion en cours...'));
  redisClient.on('ready', () => logger.info('Connexion Redis établie avec succès'));

  await redisClient.connect();
  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis non initialisé. Appelez connectRedis() au démarrage.');
  }
  return redisClient;
};

const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

module.exports = { connectRedis, getRedisClient, disconnectRedis };

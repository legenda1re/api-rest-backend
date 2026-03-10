require('dotenv').config();
const { getRedisClient, connectRedis } = require('../config/cache');
const logger = require('../config/logger');

const QUEUE_KEY = 'notifications:queue';
const POLLING_INTERVAL_MS = 1000;

let admin = null;

const initFirebase = () => {
  if (!process.env.FCM_SERVICE_ACCOUNT_KEY) {
    logger.warn('FCM_SERVICE_ACCOUNT_KEY non défini — notifications Firebase désactivées');
    return false;
  }

  try {
    admin = require('firebase-admin');
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FCM_SERVICE_ACCOUNT_KEY, 'base64').toString('utf8')
    );
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    logger.info('Firebase Admin initialisé avec succès');
    return true;
  } catch (err) {
    logger.error('Erreur initialisation Firebase', { err: err.message });
    return false;
  }
};

const processNotification = async (payload) => {
  if (!admin) {
    logger.warn('Firebase non initialisé, notification ignorée', { type: payload.type });
    return;
  }

  try {
    switch (payload.type) {
      case 'TASK_ASSIGNED': {
        logger.info('Traitement notification TASK_ASSIGNED', { taskId: payload.taskId, assigneeId: payload.assigneeId });
        // Ici on enverrait le FCM message au device token de l'assigné
        // await admin.messaging().send({ token: deviceToken, notification: { title, body } });
        break;
      }
      case 'PROJECT_CREATED': {
        logger.info('Traitement notification PROJECT_CREATED', { projectId: payload.projectId });
        break;
      }
      default:
        logger.warn('Type de notification inconnu', { type: payload.type });
    }
  } catch (err) {
    logger.error('Erreur traitement notification', { err: err.message, payload });
  }
};

const startWorker = async () => {
  logger.info('FCM Worker démarré');
  await connectRedis();
  initFirebase();

  const redis = getRedisClient();

  // Boucle infinie de consommation de la file
  const loop = async () => {
    try {
      // BLPOP bloque jusqu'à qu'un élément soit disponible (timeout 5s)
      const result = await redis.blPop(QUEUE_KEY, 5);
      if (result) {
        const payload = JSON.parse(result.element);
        await processNotification(payload);
      }
    } catch (err) {
      logger.error('Erreur dans la boucle FCM Worker', { err: err.message });
      await new Promise((r) => setTimeout(r, POLLING_INTERVAL_MS));
    }
    setImmediate(loop);
  };

  loop();
};

process.on('SIGTERM', async () => {
  logger.info('FCM Worker arrêt gracieux...');
  process.exit(0);
});

startWorker().catch((err) => {
  logger.error('Erreur fatale FCM Worker', { err: err.message });
  process.exit(1);
});

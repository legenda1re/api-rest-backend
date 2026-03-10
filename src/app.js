require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/cache');
const corsOptions = require('./config/cors');
const logger = require('./config/logger');
const routes = require('./routes');
const { errorMiddleware } = require('./middlewares/error.middleware');

// Validation des variables critiques au démarrage
const REQUIRED_VARS = ['NODE_ENV', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'REDIS_URL'];
REQUIRED_VARS.forEach((v) => {
  if (!process.env[v]) {
    logger.error(`[FATAL] Variable d'environnement manquante : ${v}`);
    process.exitCode = 1;
    throw new Error(`Variable manquante : ${v}`);
  }
});

const app = express();

// ── Sécurité ─────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));
app.use(cors(corsOptions()));
app.set('trust proxy', 1);

// ── Body parsers ──────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(compression());

// ── Request ID ────────────────────────────────────
app.use((req, _res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  next();
});

// ── Logging HTTP ──────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

// ── Routes ────────────────────────────────────────
app.use('/api/v1', routes);

// ── 404 ───────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route introuvable' } });
});

// ── Gestion globale des erreurs ───────────────────
app.use(errorMiddleware);

// ── Démarrage ─────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3000', 10);

const start = async () => {
  try {
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
      logger.info(`Serveur démarré sur le port ${PORT}`, {
        env: process.env.NODE_ENV,
        port: PORT,
      });
    });
  } catch (err) {
    logger.error('Échec du démarrage du serveur', { err: err.message });
    process.exitCode = 1;
  }
};

if (require.main === module) {
  start();
}

module.exports = app;

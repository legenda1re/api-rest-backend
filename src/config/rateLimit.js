const rateLimit = require('express-rate-limit');

const createLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Trop de requêtes. Veuillez réessayer plus tard.',
        },
      });
    },
  });
};

const loginLimiter = () => createLimiter({ windowMs: 15 * 60 * 1000, max: 5 });
const registerLimiter = () => createLimiter({ windowMs: 60 * 60 * 1000, max: 3 });
const refreshLimiter = () => createLimiter({ windowMs: 60 * 60 * 1000, max: 10 });
const apiLimiter = () => createLimiter({ windowMs: 60 * 1000, max: 100 });
const publicLimiter = () => createLimiter({ windowMs: 60 * 1000, max: 30 });

module.exports = { loginLimiter, registerLimiter, refreshLimiter, apiLimiter, publicLimiter };

const logger = require('../config/logger');
const { HTTP_STATUS, ERROR_CODES } = require('../utils/constants');

const errorMiddleware = (err, req, res, _next) => {
  const requestId = req.headers['x-request-id'] || 'unknown';

  // Erreurs connues (ApiError)
  if (err.isApiError) {
    if (err.statusCode >= HTTP_STATUS.INTERNAL_ERROR) {
      logger.error('Erreur applicative', {
        requestId,
        path: req.path,
        method: req.method,
        statusCode: err.statusCode,
        stack: err.stack,
      });
    }
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // Erreurs Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      error: { code: ERROR_CODES.CONFLICT, message: 'Cette ressource existe déjà' },
    });
  }

  if (err.name === 'SequelizeValidationError') {
    const details = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return res.status(HTTP_STATUS.UNPROCESSABLE).json({
      success: false,
      error: { code: ERROR_CODES.VALIDATION_ERROR, message: 'Données invalides', details },
    });
  }

  // Erreur inconnue — 500
  logger.error('Erreur non gérée', {
    requestId,
    path: req.path,
    method: req.method,
    stack: err.stack,
    message: err.message,
  });

  const isProd = process.env.NODE_ENV === 'production';
  return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: isProd ? 'Une erreur interne est survenue' : err.message,
    },
  });
};

// Classe d'erreur personnalisée
class ApiError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isApiError = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static notFound(message = 'Ressource introuvable') {
    return new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, message);
  }

  static unauthorized(message = 'Non authentifié') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Accès refusé') {
    return new ApiError(HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN, message);
  }

  static conflict(message = 'Conflit de données') {
    return new ApiError(HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT, message);
  }

  static badRequest(message = 'Requête invalide') {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, message);
  }
}

module.exports = { errorMiddleware, ApiError };

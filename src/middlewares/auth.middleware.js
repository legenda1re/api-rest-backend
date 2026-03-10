const { verifyAccessToken } = require('../utils/jwt');
const { error } = require('../utils/response');
const { HTTP_STATUS, ERROR_CODES, ROLES } = require('../utils/constants');
const { User } = require('../models');
const logger = require('../config/logger');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, 'Token manquant ou format invalide');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findOne({
      where: { id: decoded.userId, is_active: true },
      attributes: { exclude: ['password_hash'] },
    });

    if (!user) {
      return error(res, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, 'Utilisateur introuvable ou inactif');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.code === ERROR_CODES.TOKEN_EXPIRED) {
      return error(res, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.TOKEN_EXPIRED, 'Token expiré');
    }
    logger.error('Erreur authentification', { err: err.message });
    return error(res, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.INVALID_TOKEN, 'Token invalide');
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, 'Non authentifié');
    }
    if (!roles.includes(req.user.role)) {
      return error(res, HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN, 'Accès refusé — droits insuffisants');
    }
    next();
  };
};

const isAdmin = authorize(ROLES.ADMIN);
const isAdminOrManager = authorize(ROLES.ADMIN, ROLES.MANAGER);

module.exports = { authenticate, authorize, isAdmin, isAdminOrManager };

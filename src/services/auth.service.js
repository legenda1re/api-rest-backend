const crypto = require('crypto');
const { User, Token } = require('../models');
const { hashPassword, comparePassword, hashToken } = require('../utils/hash');
const { signAccessToken, signRefreshToken } = require('../utils/jwt');
const { ApiError } = require('../middlewares/error.middleware');
const { HTTP_STATUS, ERROR_CODES } = require('../utils/constants');
const auditService = require('./audit.service');
const logger = require('../config/logger');

const REFRESH_EXPIRES_DAYS = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '7', 10);

const register = async ({ email, password, first_name, last_name }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT, 'Cet email est déjà utilisé');
  }

  const password_hash = await hashPassword(password);
  const user = await User.create({ email, password_hash, first_name, last_name });

  await auditService.log({ userId: user.id, action: 'user.register', entityType: 'User', entityId: user.id });

  logger.info('Nouvel utilisateur créé', { userId: user.id });
  return user.toSafeJSON();
};

const login = async ({ email, password, ip, userAgent }) => {
  const user = await User.findOne({ where: { email } });
  if (!user || !user.is_active) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.INVALID_CREDENTIALS, 'Email ou mot de passe incorrect');
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    await auditService.log({ userId: user.id, action: 'user.login.failed', meta: { ip } });
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.INVALID_CREDENTIALS, 'Email ou mot de passe incorrect');
  }

  const { accessToken, refreshToken, tokenRecord } = await _generateTokenPair(user, ip, userAgent);

  await user.update({ last_login_at: new Date() });
  await auditService.log({ userId: user.id, action: 'user.login', meta: { ip } });

  return { user: user.toSafeJSON(), accessToken, refreshToken };
};

const refresh = async ({ rawRefreshToken, ip, userAgent }) => {
  const tokens = await Token.findAll({
    where: { revoked_at: null },
    include: [{ association: 'user', where: { is_active: true } }],
  });

  let matchedToken = null;
  for (const t of tokens) {
    const { compareToken } = require('../utils/hash');
    const match = await compareToken(rawRefreshToken, t.token_hash);
    if (match) {
      matchedToken = t;
      break;
    }
  }

  if (!matchedToken || !matchedToken.isValid()) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.INVALID_TOKEN, 'Refresh token invalide ou expiré');
  }

  // Rotation : révocation de l'ancien token
  await matchedToken.update({ revoked_at: new Date() });

  const user = matchedToken.user;
  const { accessToken, refreshToken } = await _generateTokenPair(user, ip, userAgent);

  return { accessToken, refreshToken };
};

const logout = async ({ rawRefreshToken }) => {
  const tokens = await Token.findAll({ where: { revoked_at: null } });

  for (const t of tokens) {
    const { compareToken } = require('../utils/hash');
    const match = await compareToken(rawRefreshToken, t.token_hash);
    if (match) {
      await t.update({ revoked_at: new Date() });
      return;
    }
  }
};

const _generateTokenPair = async (user, ip, userAgent) => {
  const rawRefreshToken = crypto.randomBytes(64).toString('hex');
  const token_hash = await hashToken(rawRefreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS);

  const tokenRecord = await Token.create({
    user_id: user.id,
    token_hash,
    expires_at: expiresAt,
    ip_address: ip,
    user_agent: userAgent,
  });

  const accessToken = signAccessToken({ userId: user.id, role: user.role, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id, tokenId: tokenRecord.id });

  return { accessToken, refreshToken: rawRefreshToken, tokenRecord };
};

module.exports = { register, login, refresh, logout };

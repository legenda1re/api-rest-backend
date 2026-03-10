const jwt = require('jsonwebtoken');
const { ERROR_CODES } = require('./constants');

const getAccessSecret = () => {
  const secret = process.env.JWT_PRIVATE_KEY || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("[FATAL] JWT_PRIVATE_KEY ou JWT_SECRET manquant");
  }
  return secret;
};

const getPublicKey = () => {
  return process.env.JWT_PUBLIC_KEY || process.env.JWT_SECRET;
};

const signAccessToken = (payload) => {
  return jwt.sign(payload, getAccessSecret(), {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    algorithm: process.env.NODE_ENV === 'production' ? 'RS256' : 'HS256',
  });
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, getPublicKey(), {
      algorithms: process.env.NODE_ENV === 'production' ? ['RS256'] : ['HS256'],
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      const e = new Error('Token expiré');
      e.code = ERROR_CODES.TOKEN_EXPIRED;
      throw e;
    }
    const e = new Error('Token invalide');
    e.code = ERROR_CODES.INVALID_TOKEN;
    throw e;
  }
};

const signRefreshToken = (payload) => {
  return jwt.sign(payload, getAccessSecret(), {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    algorithm: process.env.NODE_ENV === 'production' ? 'RS256' : 'HS256',
  });
};

module.exports = { signAccessToken, verifyAccessToken, signRefreshToken };

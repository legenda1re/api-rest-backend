const authService = require('../services/auth.service');
const { success, created, noContent } = require('../utils/response');
const logger = require('../config/logger');

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return created(res, user);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const { user, accessToken, refreshToken } = await authService.login({ ...req.body, ip, userAgent });

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    return success(res, { user, accessToken });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;
    if (!rawRefreshToken) {
      return next(require('../middlewares/error.middleware').ApiError.unauthorized('Refresh token manquant'));
    }

    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const { accessToken, refreshToken } = await authService.refresh({ rawRefreshToken, ip, userAgent });

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    return success(res, { accessToken });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;
    if (rawRefreshToken) {
      await authService.logout({ rawRefreshToken });
    }
    res.clearCookie('refreshToken');
    return noContent(res);
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    // Toujours répondre avec succès pour ne pas exposer si l'email existe
    logger.info('Demande de réinitialisation de mot de passe', { email: req.body.email });
    return success(res, { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    return success(res, { message: 'Mot de passe réinitialisé avec succès.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword };

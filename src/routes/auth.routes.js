const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate, schemas } = require('../middlewares/validate.middleware');
const { loginLimiter, registerLimiter, refreshLimiter, publicLimiter } = require('../config/rateLimit');

router.post('/register', registerLimiter(), validate(schemas.auth.register), authController.register);
router.post('/login', loginLimiter(), validate(schemas.auth.login), authController.login);
router.post('/refresh', refreshLimiter(), authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', publicLimiter(), validate(schemas.auth.forgotPassword), authController.forgotPassword);
router.post('/reset-password', publicLimiter(), validate(schemas.auth.resetPassword), authController.resetPassword);

module.exports = router;

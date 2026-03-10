const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const { validate, schemas } = require('../middlewares/validate.middleware');
const { apiLimiter } = require('../config/rateLimit');

router.use(authenticate);
router.use(apiLimiter());

router.get('/', isAdmin, usersController.getAll);
router.get('/:id', usersController.getById);
router.put('/:id', validate(schemas.user.update), usersController.update);
router.patch('/:id/role', isAdmin, validate(schemas.user.updateRole), usersController.updateRole);
router.delete('/:id', isAdmin, usersController.remove);

module.exports = router;

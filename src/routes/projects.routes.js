const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects.controller');
const { authenticate, isAdmin, isAdminOrManager } = require('../middlewares/auth.middleware');
const { validate, schemas } = require('../middlewares/validate.middleware');
const { apiLimiter } = require('../config/rateLimit');

router.use(authenticate);
router.use(apiLimiter());

router.get('/', projectsController.getAll);
router.post('/', isAdminOrManager, validate(schemas.project.create), projectsController.create);
router.get('/:id', projectsController.getById);
router.put('/:id', validate(schemas.project.update), projectsController.update);
router.patch('/:id/archive', projectsController.archive);
router.delete('/:id', isAdmin, projectsController.remove);

module.exports = router;

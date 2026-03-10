const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate, schemas } = require('../middlewares/validate.middleware');
const { apiLimiter } = require('../config/rateLimit');

router.use(authenticate);
router.use(apiLimiter());

router.get('/', tasksController.getAll);
router.post('/', validate(schemas.task.create), tasksController.create);
router.get('/:id', tasksController.getById);
router.put('/:id', validate(schemas.task.update), tasksController.update);
router.patch('/:id/status', validate(schemas.task.updateStatus), tasksController.updateStatus);
router.patch('/:id/assign', validate(schemas.task.assign), tasksController.assign);
router.delete('/:id', tasksController.remove);

module.exports = router;

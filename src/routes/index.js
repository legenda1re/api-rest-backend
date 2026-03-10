const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const projectsRoutes = require('./projects.routes');
const tasksRoutes = require('./tasks.routes');

// Health check (sans auth, sans rate limit)
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
    },
  });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/projects', projectsRoutes);
router.use('/tasks', tasksRoutes);

module.exports = router;

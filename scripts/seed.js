require('dotenv').config();
const { sequelize, connectDB } = require('../src/config/database');
const { connectRedis, disconnectRedis } = require('../src/config/cache');
const { hashPassword } = require('../src/utils/hash');
const logger = require('../src/config/logger');

const { User, Project, Task } = require('../src/models');

const seed = async () => {
  try {
    await connectDB();
    await connectRedis();

    logger.info('Début du seeding...');

    // Admin
    const adminHash = await hashPassword('Admin@1234');
    const [admin] = await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        email: 'admin@example.com',
        password_hash: adminHash,
        first_name: 'Super',
        last_name: 'Admin',
        role: 'admin',
        is_active: true,
      },
    });

    // Manager
    const managerHash = await hashPassword('Manager@1234');
    const [manager] = await User.findOrCreate({
      where: { email: 'manager@example.com' },
      defaults: {
        email: 'manager@example.com',
        password_hash: managerHash,
        first_name: 'Chef',
        last_name: 'Projet',
        role: 'manager',
        is_active: true,
      },
    });

    // Member
    const memberHash = await hashPassword('Member@1234');
    const [member] = await User.findOrCreate({
      where: { email: 'member@example.com' },
      defaults: {
        email: 'member@example.com',
        password_hash: memberHash,
        first_name: 'Jean',
        last_name: 'Dupont',
        role: 'member',
        is_active: true,
      },
    });

    // Projet demo
    const [project] = await Project.findOrCreate({
      where: { name: 'Projet Démo' },
      defaults: {
        name: 'Projet Démo',
        description: 'Projet de démonstration créé par le seed',
        status: 'active',
        owner_id: manager.id,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Tâches demo
    await Task.findOrCreate({
      where: { title: 'Configurer l\'environnement', project_id: project.id },
      defaults: {
        title: 'Configurer l\'environnement',
        description: 'Setup Node.js, MySQL, Redis',
        status: 'done',
        priority: 'high',
        project_id: project.id,
        assignee_id: member.id,
      },
    });

    await Task.findOrCreate({
      where: { title: 'Implémenter l\'authentification', project_id: project.id },
      defaults: {
        title: 'Implémenter l\'authentification',
        description: 'JWT + Refresh tokens',
        status: 'in_progress',
        priority: 'critical',
        project_id: project.id,
        assignee_id: member.id,
      },
    });

    await Task.findOrCreate({
      where: { title: 'Écrire les tests', project_id: project.id },
      defaults: {
        title: 'Écrire les tests',
        description: 'Tests unitaires et d\'intégration',
        status: 'todo',
        priority: 'high',
        project_id: project.id,
      },
    });

    logger.info('Seeding terminé avec succès', {
      users: ['admin@example.com', 'manager@example.com', 'member@example.com'],
      projects: [project.name],
    });

    await disconnectRedis();
    process.exit(0);
  } catch (err) {
    logger.error('Erreur lors du seeding', { err: err.message, stack: err.stack });
    process.exit(1);
  }
};

seed();

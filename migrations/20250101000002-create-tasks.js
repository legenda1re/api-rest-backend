'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tasks', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      status: { type: Sequelize.ENUM('todo', 'in_progress', 'review', 'done'), allowNull: false, defaultValue: 'todo' },
      priority: { type: Sequelize.ENUM('low', 'medium', 'high', 'critical'), allowNull: false, defaultValue: 'medium' },
      project_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, references: { model: 'projects', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      assignee_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      due_date: { type: Sequelize.DATEONLY, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    }, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' });

    await queryInterface.addIndex('tasks', ['project_id'], { name: 'idx_tasks_project_id' });
    await queryInterface.addIndex('tasks', ['assignee_id'], { name: 'idx_tasks_assignee_id' });
    await queryInterface.addIndex('tasks', ['status'], { name: 'idx_tasks_status' });
    await queryInterface.addIndex('tasks', ['priority'], { name: 'idx_tasks_priority' });
    await queryInterface.addIndex('tasks', ['deleted_at'], { name: 'idx_tasks_deleted_at' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tasks');
  },
};

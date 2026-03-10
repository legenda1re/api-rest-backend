'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      action: { type: Sequelize.STRING(100), allowNull: false },
      entity_type: { type: Sequelize.STRING(50), allowNull: true },
      entity_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
      meta: { type: Sequelize.JSON, allowNull: true },
      ip_address: { type: Sequelize.STRING(45), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    }, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' });

    await queryInterface.addIndex('audit_logs', ['user_id'], { name: 'idx_audit_logs_user_id' });
    await queryInterface.addIndex('audit_logs', ['action'], { name: 'idx_audit_logs_action' });
    await queryInterface.addIndex('audit_logs', ['entity_type', 'entity_id'], { name: 'idx_audit_logs_entity' });
    await queryInterface.addIndex('audit_logs', ['created_at'], { name: 'idx_audit_logs_created_at' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs');
  },
};

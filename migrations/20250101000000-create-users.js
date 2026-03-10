'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      first_name: { type: Sequelize.STRING(100), allowNull: false },
      last_name: { type: Sequelize.STRING(100), allowNull: false },
      role: { type: Sequelize.ENUM('admin', 'manager', 'member'), allowNull: false, defaultValue: 'member' },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      last_login_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    }, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' });

    await queryInterface.addIndex('users', ['email'], { unique: true, name: 'idx_users_email' });
    await queryInterface.addIndex('users', ['role'], { name: 'idx_users_role' });
    await queryInterface.addIndex('users', ['is_active'], { name: 'idx_users_is_active' });
    await queryInterface.addIndex('users', ['deleted_at'], { name: 'idx_users_deleted_at' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};

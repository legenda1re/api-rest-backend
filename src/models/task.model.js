const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { TASK_STATUS, TASK_PRIORITY } = require('../utils/constants');

class Task extends Model {}

Task.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { len: [1, 255] },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        TASK_STATUS.TODO,
        TASK_STATUS.IN_PROGRESS,
        TASK_STATUS.REVIEW,
        TASK_STATUS.DONE
      ),
      allowNull: false,
      defaultValue: TASK_STATUS.TODO,
    },
    priority: {
      type: DataTypes.ENUM(
        TASK_PRIORITY.LOW,
        TASK_PRIORITY.MEDIUM,
        TASK_PRIORITY.HIGH,
        TASK_PRIORITY.CRITICAL
      ),
      allowNull: false,
      defaultValue: TASK_PRIORITY.MEDIUM,
    },
    project_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'projects', key: 'id' },
    },
    assignee_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
    timestamps: true,
    underscored: true,
    paranoid: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    indexes: [
      { fields: ['project_id'] },
      { fields: ['assignee_id'] },
      { fields: ['status'] },
      { fields: ['priority'] },
      { fields: ['deleted_at'] },
    ],
  }
);

module.exports = Task;

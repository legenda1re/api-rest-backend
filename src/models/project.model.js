const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { PROJECT_STATUS } = require('../utils/constants');

class Project extends Model {}

Project.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { len: [1, 255] },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(PROJECT_STATUS.ACTIVE, PROJECT_STATUS.ARCHIVED, PROJECT_STATUS.COMPLETED),
      allowNull: false,
      defaultValue: PROJECT_STATUS.ACTIVE,
    },
    owner_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    deadline: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Project',
    tableName: 'projects',
    timestamps: true,
    underscored: true,
    paranoid: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    indexes: [
      { fields: ['owner_id'] },
      { fields: ['status'] },
      { fields: ['deleted_at'] },
    ],
  }
);

module.exports = Project;

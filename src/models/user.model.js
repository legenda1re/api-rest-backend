const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { ROLES } = require('../utils/constants');

class User extends Model {
  toSafeJSON() {
    const { password_hash, ...safe } = this.toJSON();
    return safe;
  }
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { len: [1, 100] },
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { len: [1, 100] },
    },
    role: {
      type: DataTypes.ENUM(ROLES.ADMIN, ROLES.MANAGER, ROLES.MEMBER),
      allowNull: false,
      defaultValue: ROLES.MEMBER,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    paranoid: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    indexes: [
      { unique: true, fields: ['email'] },
      { fields: ['role'] },
      { fields: ['is_active'] },
    ],
  }
);

module.exports = User;

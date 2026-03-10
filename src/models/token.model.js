const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Token extends Model {
  isExpired() {
    return new Date() > new Date(this.expires_at);
  }

  isRevoked() {
    return this.revoked_at !== null;
  }

  isValid() {
    return !this.isExpired() && !this.isRevoked();
  }
}

Token.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Token',
    tableName: 'tokens',
    timestamps: true,
    underscored: true,
    updatedAt: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    indexes: [
      { fields: ['user_id'] },
      { unique: true, fields: ['token_hash'] },
      { fields: ['expires_at'] },
    ],
  }
);

module.exports = Token;

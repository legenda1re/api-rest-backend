const { User } = require('../models');
const { hashPassword } = require('../utils/hash');
const { ApiError } = require('../middlewares/error.middleware');
const { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } = require('../utils/constants');
const auditService = require('./audit.service');

const findAll = async ({ page = 1, limit = PAGINATION_DEFAULT_LIMIT, sort = 'created_at', order = 'DESC' }) => {
  const safeLimit = Math.min(parseInt(limit, 10), PAGINATION_MAX_LIMIT);
  const offset = (parseInt(page, 10) - 1) * safeLimit;

  const { count, rows } = await User.findAndCountAll({
    attributes: { exclude: ['password_hash'] },
    order: [[sort, order]],
    limit: safeLimit,
    offset,
  });

  return { data: rows, total: count };
};

const findById = async (id) => {
  const user = await User.findByPk(id, { attributes: { exclude: ['password_hash'] } });
  if (!user) {
    throw ApiError.notFound('Utilisateur introuvable');
  }
  return user;
};

const update = async (id, payload, requesterId) => {
  const user = await findById(id);

  if (payload.email && payload.email !== user.email) {
    const existing = await User.findOne({ where: { email: payload.email } });
    if (existing) {
      throw ApiError.conflict('Cet email est déjà utilisé');
    }
  }

  if (payload.password) {
    payload.password_hash = await hashPassword(payload.password);
    delete payload.password;
  }

  await user.update(payload);
  await auditService.log({ userId: requesterId, action: 'user.update', entityType: 'User', entityId: id });

  return user.toSafeJSON();
};

const updateRole = async (id, role, requesterId) => {
  const user = await findById(id);
  const previousRole = user.role;
  await user.update({ role });
  await auditService.log({
    userId: requesterId,
    action: 'user.role.update',
    entityType: 'User',
    entityId: id,
    meta: { previousRole, newRole: role },
  });
  return user.toSafeJSON();
};

const remove = async (id, requesterId) => {
  const user = await findById(id);
  await user.destroy();
  await auditService.log({ userId: requesterId, action: 'user.delete', entityType: 'User', entityId: id });
};

module.exports = { findAll, findById, update, updateRole, remove };

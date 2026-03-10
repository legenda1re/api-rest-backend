const { Op } = require('sequelize');
const { Project, Task, User } = require('../models');
const { ApiError } = require('../middlewares/error.middleware');
const { PROJECT_STATUS, ROLES, PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } = require('../utils/constants');
const auditService = require('./audit.service');

const findAll = async ({ page = 1, limit = PAGINATION_DEFAULT_LIMIT, status, owner_id, sort = 'created_at', order = 'DESC', requestingUser }) => {
  const safeLimit = Math.min(parseInt(limit, 10), PAGINATION_MAX_LIMIT);
  const offset = (parseInt(page, 10) - 1) * safeLimit;
  const where = {};

  if (status) {
    where.status = status;
  }
  if (owner_id) {
    where.owner_id = owner_id;
  }
  if (requestingUser.role === ROLES.MEMBER) {
    where.owner_id = requestingUser.id;
  }

  const { count, rows } = await Project.findAndCountAll({
    where,
    include: [{ model: User, as: 'owner', attributes: ['id', 'first_name', 'last_name', 'email'] }],
    order: [[sort, order]],
    limit: safeLimit,
    offset,
  });

  return { data: rows, total: count };
};

const findById = async (id, requestingUser) => {
  const project = await Project.findByPk(id, {
    include: [{ model: User, as: 'owner', attributes: ['id', 'first_name', 'last_name', 'email'] }],
  });
  if (!project) {
    throw ApiError.notFound('Projet introuvable');
  }
  if (requestingUser.role === ROLES.MEMBER && project.owner_id !== requestingUser.id) {
    throw ApiError.forbidden('Accès refusé à ce projet');
  }
  return project;
};

const create = async ({ name, description, deadline, requestingUser }) => {
  const project = await Project.create({
    name,
    description,
    deadline,
    owner_id: requestingUser.id,
  });
  await auditService.log({ userId: requestingUser.id, action: 'project.create', entityType: 'Project', entityId: project.id });
  return project;
};

const update = async (id, payload, requestingUser) => {
  const project = await findById(id, requestingUser);

  if (requestingUser.role !== ROLES.ADMIN && project.owner_id !== requestingUser.id) {
    throw ApiError.forbidden('Seul le propriétaire ou un admin peut modifier ce projet');
  }

  await project.update(payload);
  await auditService.log({ userId: requestingUser.id, action: 'project.update', entityType: 'Project', entityId: id });
  return project;
};

const archive = async (id, requestingUser) => {
  const project = await findById(id, requestingUser);
  if (requestingUser.role !== ROLES.ADMIN && project.owner_id !== requestingUser.id) {
    throw ApiError.forbidden();
  }
  await project.update({ status: PROJECT_STATUS.ARCHIVED });
  await auditService.log({ userId: requestingUser.id, action: 'project.archive', entityType: 'Project', entityId: id });
  return project;
};

const remove = async (id, requestingUser) => {
  const project = await findById(id, requestingUser);
  await Task.destroy({ where: { project_id: project.id } });
  await project.destroy();
  await auditService.log({ userId: requestingUser.id, action: 'project.delete', entityType: 'Project', entityId: id });
};

module.exports = { findAll, findById, create, update, archive, remove };

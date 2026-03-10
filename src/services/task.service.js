const { Task, Project, User } = require('../models');
const { ApiError } = require('../middlewares/error.middleware');
const { TASK_STATUS_TRANSITIONS, ROLES, ERROR_CODES, HTTP_STATUS, PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } = require('../utils/constants');
const auditService = require('./audit.service');
const notificationService = require('./notification.service');

const _checkProjectAccess = async (projectId, requestingUser) => {
  const project = await Project.findByPk(projectId);
  if (!project) {
    throw ApiError.notFound('Projet introuvable');
  }
  if (requestingUser.role === ROLES.MEMBER && project.owner_id !== requestingUser.id) {
    throw ApiError.forbidden('Accès refusé à ce projet');
  }
  return project;
};

const findAll = async ({ page = 1, limit = PAGINATION_DEFAULT_LIMIT, project_id, status, priority, assignee_id, sort = 'created_at', order = 'DESC', requestingUser }) => {
  const safeLimit = Math.min(parseInt(limit, 10), PAGINATION_MAX_LIMIT);
  const offset = (parseInt(page, 10) - 1) * safeLimit;
  const where = {};

  if (project_id) {
    where.project_id = project_id;
  }
  if (status) {
    where.status = status;
  }
  if (priority) {
    where.priority = priority;
  }
  if (assignee_id) {
    where.assignee_id = assignee_id;
  }

  const { count, rows } = await Task.findAndCountAll({
    where,
    include: [
      { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name', 'email'], required: false },
      { model: Project, as: 'project', attributes: ['id', 'name'] },
    ],
    order: [[sort, order]],
    limit: safeLimit,
    offset,
  });

  return { data: rows, total: count };
};

const findById = async (id, requestingUser) => {
  const task = await Task.findByPk(id, {
    include: [
      { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name', 'email'], required: false },
      { model: Project, as: 'project' },
    ],
  });
  if (!task) {
    throw ApiError.notFound('Tâche introuvable');
  }
  await _checkProjectAccess(task.project_id, requestingUser);
  return task;
};

const create = async (payload, requestingUser) => {
  await _checkProjectAccess(payload.project_id, requestingUser);

  if (payload.assignee_id) {
    const assignee = await User.findByPk(payload.assignee_id);
    if (!assignee) {
      throw ApiError.notFound('Assigné introuvable');
    }
  }

  const task = await Task.create({ ...payload });
  await auditService.log({ userId: requestingUser.id, action: 'task.create', entityType: 'Task', entityId: task.id });
  return task;
};

const update = async (id, payload, requestingUser) => {
  const task = await findById(id, requestingUser);
  const project = task.project;

  const canEdit =
    requestingUser.role === ROLES.ADMIN ||
    project.owner_id === requestingUser.id ||
    task.assignee_id === requestingUser.id;

  if (!canEdit) {
    throw ApiError.forbidden();
  }

  await task.update(payload);
  await auditService.log({ userId: requestingUser.id, action: 'task.update', entityType: 'Task', entityId: id });
  return task;
};

const updateStatus = async (id, newStatus, requestingUser) => {
  const task = await findById(id, requestingUser);
  const allowed = TASK_STATUS_TRANSITIONS[task.status] || [];

  if (!allowed.includes(newStatus)) {
    throw new ApiError(
      HTTP_STATUS.UNPROCESSABLE,
      ERROR_CODES.INVALID_STATUS_TRANSITION,
      `Transition invalide : ${task.status} → ${newStatus}. Transitions autorisées : ${allowed.join(', ') || 'aucune'}`
    );
  }

  await task.update({ status: newStatus });
  await auditService.log({ userId: requestingUser.id, action: 'task.status.update', entityType: 'Task', entityId: id, meta: { from: task.status, to: newStatus } });
  return task;
};

const assign = async (id, assigneeId, requestingUser) => {
  const task = await findById(id, requestingUser);
  const project = task.project;

  const canAssign =
    requestingUser.role === ROLES.ADMIN ||
    project.owner_id === requestingUser.id ||
    [ROLES.MANAGER].includes(requestingUser.role);

  if (!canAssign) {
    throw ApiError.forbidden();
  }

  if (assigneeId) {
    const assignee = await User.findByPk(assigneeId);
    if (!assignee) {
      throw ApiError.notFound('Assigné introuvable');
    }
    await notificationService.sendTaskAssigned({ task, assignee });
  }

  await task.update({ assignee_id: assigneeId });
  await auditService.log({ userId: requestingUser.id, action: 'task.assign', entityType: 'Task', entityId: id, meta: { assigneeId } });
  return task;
};

const remove = async (id, requestingUser) => {
  const task = await findById(id, requestingUser);
  const project = task.project;

  if (requestingUser.role !== ROLES.ADMIN && project.owner_id !== requestingUser.id) {
    throw ApiError.forbidden();
  }

  await task.destroy();
  await auditService.log({ userId: requestingUser.id, action: 'task.delete', entityType: 'Task', entityId: id });
};

module.exports = { findAll, findById, create, update, updateStatus, assign, remove };

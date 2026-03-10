const taskService = require('../services/task.service');
const { success, created, noContent, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, sort, order, project_id, status, priority, assignee_id } = req.query;
    const { data, total } = await taskService.findAll({
      page, limit, sort, order, project_id, status, priority, assignee_id, requestingUser: req.user,
    });
    return paginated(res, data, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const task = await taskService.findById(req.params.id, req.user);
    return success(res, task);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const task = await taskService.create(req.body, req.user);
    return created(res, task);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const task = await taskService.update(req.params.id, req.body, req.user);
    return success(res, task);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const task = await taskService.updateStatus(req.params.id, req.body.status, req.user);
    return success(res, task);
  } catch (err) {
    next(err);
  }
};

const assign = async (req, res, next) => {
  try {
    const task = await taskService.assign(req.params.id, req.body.assignee_id, req.user);
    return success(res, task);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await taskService.remove(req.params.id, req.user);
    return noContent(res);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, updateStatus, assign, remove };

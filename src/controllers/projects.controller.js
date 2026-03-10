const projectService = require('../services/project.service');
const { success, created, noContent, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, sort, order, status, owner_id } = req.query;
    const { data, total } = await projectService.findAll({ page, limit, sort, order, status, owner_id, requestingUser: req.user });
    return paginated(res, data, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const project = await projectService.findById(req.params.id, req.user);
    return success(res, project);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const project = await projectService.create({ ...req.body, requestingUser: req.user });
    return created(res, project);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const project = await projectService.update(req.params.id, req.body, req.user);
    return success(res, project);
  } catch (err) {
    next(err);
  }
};

const archive = async (req, res, next) => {
  try {
    const project = await projectService.archive(req.params.id, req.user);
    return success(res, project);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await projectService.remove(req.params.id, req.user);
    return noContent(res);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, archive, remove };

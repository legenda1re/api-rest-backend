const userService = require('../services/user.service');
const { success, noContent, paginated } = require('../utils/response');
const { ApiError } = require('../middlewares/error.middleware');
const { ROLES } = require('../utils/constants');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, sort, order } = req.query;
    const { data, total } = await userService.findAll({ page, limit, sort, order });
    return paginated(res, data, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.role !== ROLES.ADMIN && req.user.id !== parseInt(id, 10)) {
      return next(ApiError.forbidden());
    }
    const user = await userService.findById(id);
    return success(res, user);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.role !== ROLES.ADMIN && req.user.id !== parseInt(id, 10)) {
      return next(ApiError.forbidden());
    }
    const user = await userService.update(id, req.body, req.user.id);
    return success(res, user);
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.id === parseInt(id, 10)) {
      return next(ApiError.forbidden('Vous ne pouvez pas modifier votre propre rôle'));
    }
    const user = await userService.updateRole(id, req.body.role, req.user.id);
    return success(res, user);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await userService.remove(id, req.user.id);
    return noContent(res);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, update, updateRole, remove };

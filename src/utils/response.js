const { HTTP_STATUS } = require('./constants');

const success = (res, data = null, statusCode = HTTP_STATUS.OK, meta = null) => {
  const response = { success: true, data };
  if (meta) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
};

const created = (res, data) => success(res, data, HTTP_STATUS.CREATED);

const noContent = (res) => res.status(HTTP_STATUS.NO_CONTENT).send();

const paginated = (res, data, { page, limit, total }) => {
  return success(res, data, HTTP_STATUS.OK, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  });
};

const error = (res, statusCode, code, message, details = null) => {
  const response = {
    success: false,
    error: { code, message },
  };
  if (details) {
    response.error.details = details;
  }
  return res.status(statusCode).json(response);
};

module.exports = { success, created, noContent, paginated, error };

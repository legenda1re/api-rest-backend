const Joi = require('joi');
const { error } = require('../utils/response');
const { HTTP_STATUS, ERROR_CODES } = require('../utils/constants');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'body' ? req.body : source === 'params' ? req.params : req.query;
    const { error: validationError, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (validationError) {
      const details = validationError.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return error(
        res,
        HTTP_STATUS.UNPROCESSABLE,
        ERROR_CODES.VALIDATION_ERROR,
        'Données invalides',
        details
      );
    }

    if (source === 'body') {
      req.body = value;
    } else if (source === 'params') {
      req.params = value;
    } else {
      req.query = value;
    }
    next();
  };
};

// Schémas de validation
const schemas = {
  auth: {
    register: Joi.object({
      email: Joi.string().email().max(255).required(),
      password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])/)
        .required()
        .messages({
          'string.pattern.base': 'Le mot de passe doit contenir au moins 1 majuscule, 1 chiffre et 1 caractère spécial',
        }),
      first_name: Joi.string().min(1).max(100).required(),
      last_name: Joi.string().min(1).max(100).required(),
    }),
    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
    forgotPassword: Joi.object({
      email: Joi.string().email().required(),
    }),
    resetPassword: Joi.object({
      token: Joi.string().required(),
      password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])/)
        .required(),
    }),
  },
  user: {
    update: Joi.object({
      first_name: Joi.string().min(1).max(100),
      last_name: Joi.string().min(1).max(100),
      email: Joi.string().email().max(255),
    }).min(1),
    updateRole: Joi.object({
      role: Joi.string().valid('admin', 'manager', 'member').required(),
    }),
  },
  project: {
    create: Joi.object({
      name: Joi.string().min(1).max(255).required(),
      description: Joi.string().max(5000).allow(null, ''),
      deadline: Joi.date().iso().allow(null),
    }),
    update: Joi.object({
      name: Joi.string().min(1).max(255),
      description: Joi.string().max(5000).allow(null, ''),
      deadline: Joi.date().iso().allow(null),
      status: Joi.string().valid('active', 'archived', 'completed'),
    }).min(1),
  },
  task: {
    create: Joi.object({
      title: Joi.string().min(1).max(255).required(),
      description: Joi.string().max(5000).allow(null, ''),
      priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
      project_id: Joi.number().integer().positive().required(),
      assignee_id: Joi.number().integer().positive().allow(null),
      due_date: Joi.date().iso().allow(null),
    }),
    update: Joi.object({
      title: Joi.string().min(1).max(255),
      description: Joi.string().max(5000).allow(null, ''),
      priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
      due_date: Joi.date().iso().allow(null),
    }).min(1),
    updateStatus: Joi.object({
      status: Joi.string().valid('todo', 'in_progress', 'review', 'done').required(),
    }),
    assign: Joi.object({
      assignee_id: Joi.number().integer().positive().allow(null).required(),
    }),
  },
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().max(50),
    order: Joi.string().valid('ASC', 'DESC').default('DESC'),
  }),
};

module.exports = { validate, schemas };

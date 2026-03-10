const { AuditLog } = require('../models');
const logger = require('../config/logger');

const log = async ({ userId = null, action, entityType = null, entityId = null, meta = null, ip = null }) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      meta,
      ip_address: ip,
    });
  } catch (err) {
    logger.error('Échec de l\'enregistrement audit log', { err: err.message, action });
  }
};

module.exports = { log };

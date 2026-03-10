const logger = require('../config/logger');
const { getRedisClient } = require('../config/cache');

const NOTIFICATION_QUEUE_KEY = 'notifications:queue';

const enqueue = async (payload) => {
  try {
    const redis = getRedisClient();
    await redis.rPush(NOTIFICATION_QUEUE_KEY, JSON.stringify(payload));
    logger.info('Notification mise en file', { type: payload.type });
  } catch (err) {
    logger.error('Erreur enqueue notification', { err: err.message });
  }
};

const sendTaskAssigned = async ({ task, assignee }) => {
  await enqueue({
    type: 'TASK_ASSIGNED',
    taskId: task.id,
    taskTitle: task.title,
    assigneeId: assignee.id,
    assigneeEmail: assignee.email,
    timestamp: new Date().toISOString(),
  });
};

const sendProjectCreated = async ({ project, owner }) => {
  await enqueue({
    type: 'PROJECT_CREATED',
    projectId: project.id,
    projectName: project.name,
    ownerId: owner.id,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { enqueue, sendTaskAssigned, sendProjectCreated };

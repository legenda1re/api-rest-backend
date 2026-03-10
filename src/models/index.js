const User = require('./user.model');
const Project = require('./project.model');
const Task = require('./task.model');
const Token = require('./token.model');
const AuditLog = require('./auditLog.model');

// User associations
User.hasMany(Project, { foreignKey: 'owner_id', as: 'ownedProjects' });
User.hasMany(Task, { foreignKey: 'assignee_id', as: 'assignedTasks' });
User.hasMany(Token, { foreignKey: 'user_id', as: 'tokens' });
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });

// Project associations
Project.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks' });

// Task associations
Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Task.belongsTo(User, { foreignKey: 'assignee_id', as: 'assignee' });

// Token associations
Token.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// AuditLog associations
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { User, Project, Task, Token, AuditLog };

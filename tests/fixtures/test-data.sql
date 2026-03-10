-- ============================================================
-- FIXTURES DE TEST — API REST BACKEND
-- Usage : base de données de test uniquement
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE tokens;
TRUNCATE TABLE tasks;
TRUNCATE TABLE projects;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Utilisateurs (passwords = 'Test@1234' hashé bcrypt)
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at) VALUES
(1, 'admin@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewk.LG8E9jxK8Yty', 'Admin', 'User', 'admin', 1, NOW(), NOW()),
(2, 'manager@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewk.LG8E9jxK8Yty', 'Manager', 'User', 'manager', 1, NOW(), NOW()),
(3, 'member@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewk.LG8E9jxK8Yty', 'Member', 'User', 'member', 1, NOW(), NOW());

-- Projets
INSERT INTO projects (id, name, description, status, owner_id, created_at, updated_at) VALUES
(1, 'Projet Alpha', 'Premier projet de test', 'active', 2, NOW(), NOW()),
(2, 'Projet Beta', 'Deuxième projet de test', 'active', 2, NOW(), NOW());

-- Tâches
INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id, created_at, updated_at) VALUES
(1, 'Tâche 1', 'Description tâche 1', 'todo', 'high', 1, 3, NOW(), NOW()),
(2, 'Tâche 2', 'Description tâche 2', 'in_progress', 'medium', 1, NULL, NOW(), NOW()),
(3, 'Tâche 3', 'Description tâche 3', 'review', 'low', 2, 3, NOW(), NOW());

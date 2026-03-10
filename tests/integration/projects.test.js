'use strict';

const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.TEST_DB_HOST || 'localhost';
process.env.DB_PORT = process.env.TEST_DB_PORT || '3306';
process.env.DB_NAME = process.env.TEST_DB_NAME || 'testdb';
process.env.DB_USER = process.env.TEST_DB_USER || 'root';
process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD || 'testpass';
process.env.REDIS_URL = process.env.TEST_REDIS_URL || 'redis://localhost:6379';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.COOKIE_SECRET = 'test-cookie-secret-32-characters!!';
process.env.CORS_ORIGINS = 'http://localhost:3000';

let app;
let sequelize;
let managerToken;

const registerAndLogin = async (app, role = 'manager') => {
  const email = `${role}_${Date.now()}@test.com`;
  await request(app).post('/api/v1/auth/register')
    .send({ email, password: 'Test@1234', first_name: 'Test', last_name: 'User' });

  if (role !== 'member') {
    const { User } = require('../../src/models');
    await User.update({ role }, { where: { email } });
  }

  const loginRes = await request(app).post('/api/v1/auth/login')
    .send({ email, password: 'Test@1234' });

  return loginRes.body.data.accessToken;
};

beforeAll(async () => {
  const { sequelize: db } = require('../../src/config/database');
  sequelize = db;
  await db.sync({ force: true });
  app = require('../../src/app');
  managerToken = await registerAndLogin(app, 'manager');
});

afterAll(async () => {
  if (sequelize) await sequelize.close();
  const { disconnectRedis } = require('../../src/config/cache');
  await disconnectRedis();
});

describe('POST /api/v1/projects', () => {
  it('201 — manager crée un projet', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ name: 'Nouveau Projet', description: 'Description test' });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('name', 'Nouveau Projet');
  });

  it('422 — nom manquant', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ description: 'Sans nom' });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/v1/projects', () => {
  it('200 — liste paginée des projets', async () => {
    const res = await request(app)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('total');
  });
});

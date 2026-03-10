'use strict';

const request = require('supertest');

// Setup env avant import de app
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

beforeAll(async () => {
  const { sequelize: db } = require('../../src/config/database');
  sequelize = db;
  await db.sync({ force: true });
  app = require('../../src/app');
});

afterAll(async () => {
  if (sequelize) {
    await sequelize.close();
  }
  const { disconnectRedis } = require('../../src/config/cache');
  await disconnectRedis();
});

afterEach(async () => {
  const { User, Token } = require('../../src/models');
  await Token.destroy({ where: {}, force: true });
  await User.destroy({ where: {}, force: true });
});

describe('POST /api/v1/auth/register', () => {
  it('201 — crée un utilisateur valide', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'new@test.com', password: 'Test@1234', first_name: 'Jean', last_name: 'Dupont' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('email', 'new@test.com');
    expect(res.body.data).not.toHaveProperty('password_hash');
  });

  it('422 — mot de passe trop faible', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'weak@test.com', password: 'weak', first_name: 'Jean', last_name: 'Dupont' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('409 — email déjà existant', async () => {
    const payload = { email: 'dup@test.com', password: 'Test@1234', first_name: 'Jean', last_name: 'Dupont' };
    await request(app).post('/api/v1/auth/register').send(payload);
    const res = await request(app).post('/api/v1/auth/register').send(payload);
    expect(res.status).toBe(409);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'login@test.com', password: 'Test@1234', first_name: 'Jean', last_name: 'Dupont' });
  });

  it('200 — retourne accessToken pour credentials valides', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@test.com', password: 'Test@1234' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('401 — mauvais mot de passe', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@test.com', password: 'WrongPass' });
    expect(res.status).toBe(401);
  });

  it('401 — email inexistant', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@test.com', password: 'Test@1234' });
    expect(res.status).toBe(401);
  });
});

describe('Routes protégées sans token', () => {
  it('401 — GET /api/v1/users sans token', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(401);
  });

  it('401 — GET /api/v1/projects sans token', async () => {
    const res = await request(app).get('/api/v1/projects');
    expect(res.status).toBe(401);
  });
});

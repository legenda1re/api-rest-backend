'use strict';

jest.mock('../../src/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Token: {
    create: jest.fn(),
    findAll: jest.fn(),
  },
}));

jest.mock('../../src/services/audit.service', () => ({ log: jest.fn() }));
jest.mock('../../src/utils/hash', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  hashToken: jest.fn(),
  compareToken: jest.fn(),
}));
jest.mock('../../src/utils/jwt', () => ({
  signAccessToken: jest.fn(() => 'mock-access-token'),
  signRefreshToken: jest.fn(() => 'mock-refresh-token'),
}));
jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

const authService = require('../../src/services/auth.service');
const { User, Token } = require('../../src/models');
const { hashPassword, comparePassword, hashToken } = require('../../src/utils/hash');

describe('AuthService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── REGISTER ──────────────────────────────────────────────
  describe('register()', () => {
    it('crée un utilisateur avec email unique', async () => {
      User.findOne.mockResolvedValue(null);
      hashPassword.mockResolvedValue('hashed-password');
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        first_name: 'Jean',
        last_name: 'Dupont',
        role: 'member',
        toSafeJSON: () => ({ id: 1, email: 'test@test.com', first_name: 'Jean', last_name: 'Dupont' }),
        update: jest.fn(),
      };
      User.create.mockResolvedValue(mockUser);
      Token.create.mockResolvedValue({ id: 1 });

      const result = await authService.register({
        email: 'test@test.com',
        password: 'Test@1234',
        first_name: 'Jean',
        last_name: 'Dupont',
      });

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
      expect(hashPassword).toHaveBeenCalledWith('Test@1234');
      expect(result).toHaveProperty('email', 'test@test.com');
    });

    it('lève une erreur 409 si email déjà utilisé', async () => {
      User.findOne.mockResolvedValue({ id: 1, email: 'existing@test.com' });

      await expect(authService.register({
        email: 'existing@test.com',
        password: 'Test@1234',
        first_name: 'Jean',
        last_name: 'Dupont',
      })).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  // ─── LOGIN ─────────────────────────────────────────────────
  describe('login()', () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      password_hash: 'hashed',
      is_active: true,
      role: 'member',
      toSafeJSON: () => ({ id: 1, email: 'test@test.com' }),
      update: jest.fn().mockResolvedValue(true),
    };

    it('retourne accessToken et refreshToken pour des credentials valides', async () => {
      User.findOne.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(true);
      hashToken.mockResolvedValue('hashed-refresh-token');
      Token.create.mockResolvedValue({ id: 1 });

      const result = await authService.login({
        email: 'test@test.com',
        password: 'Test@1234',
        ip: '127.0.0.1',
        userAgent: 'jest',
      });

      expect(result).toHaveProperty('accessToken', 'mock-access-token');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('lève une erreur 401 pour mot de passe incorrect', async () => {
      User.findOne.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(false);
      Token.findAll.mockResolvedValue([]);

      await expect(authService.login({
        email: 'test@test.com',
        password: 'WrongPass',
        ip: '127.0.0.1',
        userAgent: 'jest',
      })).rejects.toMatchObject({ statusCode: 401 });
    });

    it('lève une erreur 401 si utilisateur introuvable', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(authService.login({
        email: 'unknown@test.com',
        password: 'Test@1234',
        ip: '127.0.0.1',
        userAgent: 'jest',
      })).rejects.toMatchObject({ statusCode: 401 });
    });

    it('lève une erreur 401 si utilisateur inactif', async () => {
      User.findOne.mockResolvedValue({ ...mockUser, is_active: false });

      await expect(authService.login({
        email: 'test@test.com',
        password: 'Test@1234',
        ip: '127.0.0.1',
        userAgent: 'jest',
      })).rejects.toMatchObject({ statusCode: 401 });
    });
  });
});

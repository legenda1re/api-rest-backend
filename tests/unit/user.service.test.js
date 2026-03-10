'use strict';

jest.mock('../../src/models', () => ({
  User: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
  },
}));
jest.mock('../../src/services/audit.service', () => ({ log: jest.fn() }));
jest.mock('../../src/config/logger', () => ({
  info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn(),
}));

const userService = require('../../src/services/user.service');
const { User } = require('../../src/models');

const mockUser = {
  id: 1,
  email: 'test@test.com',
  first_name: 'Jean',
  last_name: 'Dupont',
  role: 'member',
  is_active: true,
  toSafeJSON: () => ({ id: 1, email: 'test@test.com', first_name: 'Jean', last_name: 'Dupont', role: 'member' }),
  update: jest.fn().mockResolvedValue(true),
  destroy: jest.fn().mockResolvedValue(true),
};

describe('UserService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('findAll()', () => {
    it('retourne la liste paginée des utilisateurs', async () => {
      User.findAndCountAll.mockResolvedValue({ count: 1, rows: [mockUser] });
      const result = await userService.findAll({ page: 1, limit: 20 });
      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findById()', () => {
    it('retourne l\'utilisateur si trouvé', async () => {
      User.findByPk.mockResolvedValue(mockUser);
      const result = await userService.findById(1);
      expect(result.id).toBe(1);
    });

    it('lève un 404 si utilisateur introuvable', async () => {
      User.findByPk.mockResolvedValue(null);
      await expect(userService.findById(999)).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('update()', () => {
    it('met à jour le prénom sans erreur', async () => {
      User.findByPk.mockResolvedValue(mockUser);
      User.findOne.mockResolvedValue(null);
      const result = await userService.update(1, { first_name: 'Pierre' }, 1);
      expect(mockUser.update).toHaveBeenCalled();
    });

    it('lève une erreur 409 si nouvel email déjà utilisé', async () => {
      User.findByPk.mockResolvedValue({ ...mockUser, email: 'old@test.com' });
      User.findOne.mockResolvedValue({ id: 2, email: 'taken@test.com' });
      await expect(userService.update(1, { email: 'taken@test.com' }, 1)).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe('updateRole()', () => {
    it('met à jour le rôle et log l\'action', async () => {
      User.findByPk.mockResolvedValue(mockUser);
      const result = await userService.updateRole(1, 'manager', 99);
      expect(mockUser.update).toHaveBeenCalledWith({ role: 'manager' });
    });
  });

  describe('remove()', () => {
    it('supprime l\'utilisateur (soft delete)', async () => {
      User.findByPk.mockResolvedValue(mockUser);
      await userService.remove(1, 99);
      expect(mockUser.destroy).toHaveBeenCalled();
    });
  });
});

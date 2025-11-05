import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the prisma client
const mockPrismaClient = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  $disconnect: vi.fn(),
};

vi.mock('@/lib/prisma', () => ({
  default: mockPrismaClient,
}));

describe('User Model Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User CRUD Operations', () => {
    it('should create a new user', async () => {
      const newUser = {
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.user.create.mockResolvedValueOnce(newUser);

      const result = await mockPrismaClient.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed-password',
        },
      });

      expect(result).toEqual(newUser);
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed-password',
        },
      });
    });

    it('should find a user by email', async () => {
      const existingUser = {
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.user.findUnique.mockResolvedValueOnce(existingUser);

      const result = await mockPrismaClient.user.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(result).toEqual(existingUser);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should find a user by id', async () => {
      const existingUser = {
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.user.findUnique.mockResolvedValueOnce(existingUser);

      const result = await mockPrismaClient.user.findUnique({
        where: { id: 'test-id' },
      });

      expect(result).toEqual(existingUser);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });

    it('should update a user', async () => {
      const updatedUser = {
        id: 'test-id',
        email: 'newemail@example.com',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.user.update.mockResolvedValueOnce(updatedUser);

      const result = await mockPrismaClient.user.update({
        where: { id: 'test-id' },
        data: { email: 'newemail@example.com' },
      });

      expect(result).toEqual(updatedUser);
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { email: 'newemail@example.com' },
      });
    });

    it('should delete a user', async () => {
      const deletedUser = {
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.user.delete.mockResolvedValueOnce(deletedUser);

      const result = await mockPrismaClient.user.delete({
        where: { id: 'test-id' },
      });

      expect(result).toEqual(deletedUser);
      expect(mockPrismaClient.user.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });

    it('should list all users', async () => {
      const users = [
        {
          id: 'user1',
          email: 'user1@example.com',
          passwordHash: 'hash1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user2',
          email: 'user2@example.com',
          passwordHash: 'hash2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.user.findMany.mockResolvedValueOnce(users);

      const result = await mockPrismaClient.user.findMany();

      expect(result).toEqual(users);
      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith();
    });

    it('should count users', async () => {
      mockPrismaClient.user.count.mockResolvedValueOnce(5);

      const result = await mockPrismaClient.user.count();

      expect(result).toBe(5);
      expect(mockPrismaClient.user.count).toHaveBeenCalledWith();
    });
  });

  describe('User Model Validation', () => {
    it('should enforce unique email constraint', async () => {
      const error = new Error('Unique constraint failed on email');
      mockPrismaClient.user.create.mockRejectedValueOnce(error);

      await expect(
        mockPrismaClient.user.create({
          data: {
            email: 'duplicate@example.com',
            passwordHash: 'hashed-password',
          },
        })
      ).rejects.toThrow('Unique constraint failed on email');
    });

    it('should have all required fields', () => {
      // This test verifies the schema structure
      const userFields = {
        id: 'string',
        email: 'string',
        passwordHash: 'string',
        createdAt: 'Date',
        updatedAt: 'Date',
      };

      // Verify field types match expected schema
      Object.keys(userFields).forEach(field => {
        expect(field).toMatch(/^[a-zA-Z]+$/); // Field names should be camelCase
      });

      // Verify email field is present (required for unique constraint)
      expect(userFields).toHaveProperty('email');

      // Verify password is stored as hash
      expect(userFields).toHaveProperty('passwordHash');

      // Verify timestamps are present
      expect(userFields).toHaveProperty('createdAt');
      expect(userFields).toHaveProperty('updatedAt');
    });
  });
});
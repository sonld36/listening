import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe('NextAuth Authorize Callback', () => {
  const mockPrisma = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Valid Credentials', () => {
    it('should return user object for valid credentials', async () => {
      const testEmail = 'test@example.com';
      const testPassword = 'TestPassword123';
      const passwordHash = await hashPassword(testPassword);

      // Mock Prisma to return a user
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: testEmail,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Get the authorize function from credentials provider
      const credentialsProvider = authOptions.providers.find(
        (p: any) => p.id === 'credentials'
      ) as any;

      const authorizeFunction = credentialsProvider?.authorize;
      expect(authorizeFunction).toBeDefined();

      // Call authorize with valid credentials
      const result = await authorizeFunction(
        { email: testEmail, password: testPassword },
        {} as any
      );

      // Should return user object
      expect(result).toBeDefined();
      expect(result).toEqual({
        id: 'user-123',
        email: testEmail,
      });

      // Should have queried for user
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: testEmail },
      });
    });
  });

  describe('Invalid Credentials - Validation Errors', () => {
    it('should return null for invalid email format', async () => {
      const credentialsProvider = authOptions.providers.find(
        (p: any) => p.id === 'credentials'
      ) as any;

      const authorizeFunction = credentialsProvider?.authorize;

      // Call with invalid email format
      const result = await authorizeFunction(
        { email: 'invalid-email', password: 'password123' },
        {} as any
      );

      // Should return null (AUTH_INVALID_CREDENTIALS)
      expect(result).toBeNull();

      // Should NOT query database for invalid format
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should return null for empty email', async () => {
      const credentialsProvider = authOptions.providers.find(
        (p: any) => p.id === 'credentials'
      ) as any;

      const authorizeFunction = credentialsProvider?.authorize;

      const result = await authorizeFunction(
        { email: '', password: 'password123' },
        {} as any
      );

      expect(result).toBeNull();
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should return null for empty password', async () => {
      const credentialsProvider = authOptions.providers.find(
        (p: any) => p.id === 'credentials'
      ) as any;

      const authorizeFunction = credentialsProvider?.authorize;

      const result = await authorizeFunction(
        { email: 'test@example.com', password: '' },
        {} as any
      );

      expect(result).toBeNull();
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should return null for missing credentials', async () => {
      const credentialsProvider = authOptions.providers.find(
        (p: any) => p.id === 'credentials'
      ) as any;

      const authorizeFunction = credentialsProvider?.authorize;

      const result = await authorizeFunction(undefined, {} as any);

      expect(result).toBeNull();
    });
  });

  describe('Invalid Credentials - User Not Found', () => {
    it('should return null when user does not exist', async () => {
      const testEmail = 'nonexistent@example.com';
      const testPassword = 'password123';

      // Mock Prisma to return null (user not found)
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const credentialsProvider = authOptions.providers.find(
        (p: any) => p.id === 'credentials'
      ) as any;

      const authorizeFunction = credentialsProvider?.authorize;

      const result = await authorizeFunction(
        { email: testEmail, password: testPassword },
        {} as any
      );

      // Should return null (AUTH_USER_NOT_FOUND)
      expect(result).toBeNull();

      // Should have queried for user
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: testEmail },
      });
    });
  });

  describe('Invalid Credentials - Wrong Password', () => {
    it('should return null for incorrect password', async () => {
      const testEmail = 'test@example.com';
      const correctPassword = 'CorrectPassword123';
      const wrongPassword = 'WrongPassword456';
      const passwordHash = await hashPassword(correctPassword);

      // Mock Prisma to return a user
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: testEmail,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const credentialsProvider = authOptions.providers.find(
        (p: any) => p.id === 'credentials'
      ) as any;

      const authorizeFunction = credentialsProvider?.authorize;

      const result = await authorizeFunction(
        { email: testEmail, password: wrongPassword },
        {} as any
      );

      // Should return null (AUTH_INVALID_CREDENTIALS)
      expect(result).toBeNull();

      // Should have queried for user
      expect(mockPrisma.user.findUnique).toHaveBeenCalled();
    });

    it('should be case-sensitive for passwords', async () => {
      const testEmail = 'test@example.com';
      const correctPassword = 'TestPassword123';
      const wrongCasePassword = 'testpassword123';
      const passwordHash = await hashPassword(correctPassword);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: testEmail,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const credentialsProvider = authOptions.providers.find(
        (p: any) => p.id === 'credentials'
      ) as any;

      const authorizeFunction = credentialsProvider?.authorize;

      const result = await authorizeFunction(
        { email: testEmail, password: wrongCasePassword },
        {} as any
      );

      // Should return null (password is case-sensitive)
      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should return null when database query fails', async () => {
      const testEmail = 'test@example.com';
      const testPassword = 'password123';

      // Mock Prisma to throw an error
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      const credentialsProvider = authOptions.providers.find(
        (p: any) => p.id === 'credentials'
      ) as any;

      const authorizeFunction = credentialsProvider?.authorize;

      const result = await authorizeFunction(
        { email: testEmail, password: testPassword },
        {} as any
      );

      // Should return null (error handled gracefully)
      expect(result).toBeNull();
    });
  });

  describe('Security - User Enumeration Prevention', () => {
    it('should return same error response for non-existent user and wrong password', async () => {
      const testEmail = 'test@example.com';
      const testPassword = 'password123';

      const credentialsProvider = authOptions.providers.find(
        (p: any) => p.id === 'credentials'
      ) as any;

      const authorizeFunction = credentialsProvider?.authorize;

      // Test 1: User doesn't exist
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result1 = await authorizeFunction(
        { email: testEmail, password: testPassword },
        {} as any
      );

      // Test 2: User exists but wrong password
      const passwordHash = await hashPassword('DifferentPassword123');
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: testEmail,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const result2 = await authorizeFunction(
        { email: testEmail, password: testPassword },
        {} as any
      );

      // Both should return null (generic response)
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });
});

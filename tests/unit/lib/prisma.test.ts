import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock the @prisma/client module
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn(),
  })),
}));

describe('Prisma Client Singleton', () => {
  beforeEach(() => {
    // Clear all module caches before each test
    vi.clearAllMocks();
    // Reset the global prisma instance
    delete (globalThis as any).prisma;
  });

  afterEach(() => {
    // Clean up after each test
    delete (globalThis as any).prisma;
  });

  it('should create a singleton instance in development', async () => {
    // Set NODE_ENV to development
    process.env.NODE_ENV = 'development';

    // Import the module - this should create the singleton
    const { default: prisma1 } = await import('@/lib/prisma');

    // Import again - should return the same instance
    vi.resetModules();
    const { default: prisma2 } = await import('@/lib/prisma');

    // In development, both imports should reference the global instance
    expect((globalThis as any).prisma).toBeDefined();
    expect(prisma1).toBe((globalThis as any).prisma);
  });

  it('should create a new instance in production', async () => {
    // Set NODE_ENV to production
    process.env.NODE_ENV = 'production';

    // Import the module
    const { default: prisma } = await import('@/lib/prisma');

    // In production, global instance should not be set
    expect((globalThis as any).prisma).toBeUndefined();
    expect(prisma).toBeDefined();
  });

  it('should configure logging based on environment', async () => {
    const { PrismaClient } = await import('@prisma/client');

    // Test development logging
    process.env.NODE_ENV = 'development';
    vi.resetModules();
    await import('@/lib/prisma');

    expect(PrismaClient).toHaveBeenCalledWith(
      expect.objectContaining({
        log: ['query', 'error', 'warn'],
      })
    );

    // Clear mocks and test production logging
    vi.clearAllMocks();
    process.env.NODE_ENV = 'production';
    vi.resetModules();
    delete (globalThis as any).prisma;

    await import('@/lib/prisma');

    expect(PrismaClient).toHaveBeenCalledWith(
      expect.objectContaining({
        log: ['error'],
      })
    );
  });

  it('should export default prisma client', async () => {
    const module = await import('@/lib/prisma');

    expect(module.default).toBeDefined();
    expect(typeof module.default).toBe('object');
  });
});
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/health/route';

// Mock the prisma client
vi.mock('@/lib/prisma', () => ({
  default: {
    $queryRaw: vi.fn(),
  },
}));

describe('Health Check API Endpoint', () => {
  let prisma: any;

  beforeEach(async () => {
    // Get the mocked prisma instance
    const module = await import('@/lib/prisma');
    prisma = module.default;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return success when database is connected', async () => {
      // Mock successful database query
      prisma.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);

      // Call the GET handler
      const response = await GET();
      const data = await response.json();

      // Verify response
      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        success: true,
        data: {
          status: 'ok',
          database: 'connected',
        },
      });
      expect(data.data.timestamp).toBeDefined();

      // Verify database query was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should return error when database connection fails', async () => {
      // Mock database connection failure
      const errorMessage = 'Connection refused';
      prisma.$queryRaw.mockRejectedValueOnce(new Error(errorMessage));

      // Mock console.error to avoid test output pollution
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Call the GET handler
      const response = await GET();
      const data = await response.json();

      // Verify error response
      expect(response.status).toBe(500);
      expect(data).toMatchObject({
        success: false,
        error: {
          code: 'HEALTH_CHECK_FAILED',
          message: 'Database connection failed',
        },
      });

      // Verify database query was attempted
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Health check failed:',
        expect.any(Error)
      );

      // Clean up
      consoleErrorSpy.mockRestore();
    });

    it('should include error details in development mode', async () => {
      // Set NODE_ENV to development
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Mock database connection failure
      const errorMessage = 'Connection timeout';
      prisma.$queryRaw.mockRejectedValueOnce(new Error(errorMessage));

      // Mock console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Call the GET handler
      const response = await GET();
      const data = await response.json();

      // Verify error details are included in development
      expect(data.error.details).toBe(errorMessage);

      // Restore environment
      process.env.NODE_ENV = originalEnv;
      consoleErrorSpy.mockRestore();
    });

    it('should not include error details in production mode', async () => {
      // Set NODE_ENV to production
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Mock database connection failure
      const errorMessage = 'Connection error';
      prisma.$queryRaw.mockRejectedValueOnce(new Error(errorMessage));

      // Mock console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Call the GET handler
      const response = await GET();
      const data = await response.json();

      // Verify error details are NOT included in production
      expect(data.error.details).toBeUndefined();

      // Restore environment
      process.env.NODE_ENV = originalEnv;
      consoleErrorSpy.mockRestore();
    });
  });
});
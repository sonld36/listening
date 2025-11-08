import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/clips/route';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    videoClip: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('Video Clips List API Endpoint', () => {
  let prisma: any;

  beforeEach(async () => {
    const prismaModule = await import('@/lib/prisma');
    prisma = prismaModule.default;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createMockClip = (id: string, overrides = {}) => ({
    id,
    title: `Test Clip ${id}`,
    description: 'Test description',
    clipUrl: `https://test-bucket.r2.dev/${id}.mp4`,
    durationSeconds: 10,
    difficultyLevel: 'BEGINNER' as const,
    subtitleText: 'Test subtitle',
    difficultyWords: null,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
  });

  describe('GET /api/clips', () => {
    it('should return paginated list of clips with default parameters', async () => {
      const mockClips = [
        createMockClip('clip-1'),
        createMockClip('clip-2'),
        createMockClip('clip-3'),
      ];

      prisma.videoClip.findMany.mockResolvedValueOnce(mockClips);
      prisma.videoClip.count.mockResolvedValueOnce(15);

      const request = new NextRequest('http://localhost:3000/api/clips');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        success: true,
        data: {
          clips: expect.arrayContaining([
            expect.objectContaining({
              id: 'clip-1',
              title: 'Test Clip clip-1',
            }),
          ]),
          pagination: {
            total: 15,
            limit: 10,
            offset: 0,
            hasMore: true,
          },
        },
      });

      expect(prisma.videoClip.findMany).toHaveBeenCalledWith({
        where: {},
        take: 10,
        skip: 0,
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
    });

    it('should respect limit and offset query parameters', async () => {
      const mockClips = [createMockClip('clip-1')];

      prisma.videoClip.findMany.mockResolvedValueOnce(mockClips);
      prisma.videoClip.count.mockResolvedValueOnce(25);

      const request = new NextRequest('http://localhost:3000/api/clips?limit=5&offset=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.pagination).toMatchObject({
        total: 25,
        limit: 5,
        offset: 10,
        hasMore: true,
      });

      expect(prisma.videoClip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
          skip: 10,
        })
      );
    });

    it('should filter by difficulty level', async () => {
      const mockClips = [
        createMockClip('clip-1', { difficultyLevel: 'ADVANCED' }),
        createMockClip('clip-2', { difficultyLevel: 'ADVANCED' }),
      ];

      prisma.videoClip.findMany.mockResolvedValueOnce(mockClips);
      prisma.videoClip.count.mockResolvedValueOnce(2);

      const request = new NextRequest('http://localhost:3000/api/clips?difficulty=ADVANCED');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.clips).toHaveLength(2);

      expect(prisma.videoClip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { difficultyLevel: 'ADVANCED' },
        })
      );
    });

    it('should return error for invalid limit parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/clips?limit=150');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        error: {
          code: 'CLIP_LIST_INVALID_PARAMS',
          message: 'Invalid query parameters',
        },
      });
    });

    it('should return error for negative offset', async () => {
      const request = new NextRequest('http://localhost:3000/api/clips?offset=-5');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        error: {
          code: 'CLIP_LIST_INVALID_PARAMS',
        },
      });
    });

    it('should return error for invalid difficulty level', async () => {
      const request = new NextRequest('http://localhost:3000/api/clips?difficulty=INVALID');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        error: {
          code: 'CLIP_LIST_INVALID_PARAMS',
        },
      });
    });

    it('should indicate hasMore correctly when on last page', async () => {
      const mockClips = [createMockClip('clip-1')];

      prisma.videoClip.findMany.mockResolvedValueOnce(mockClips);
      prisma.videoClip.count.mockResolvedValueOnce(11);

      const request = new NextRequest('http://localhost:3000/api/clips?limit=10&offset=10');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.pagination.hasMore).toBe(false);
    });

    it('should return empty array when no clips exist', async () => {
      prisma.videoClip.findMany.mockResolvedValueOnce([]);
      prisma.videoClip.count.mockResolvedValueOnce(0);

      const request = new NextRequest('http://localhost:3000/api/clips');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.clips).toEqual([]);
      expect(data.data.pagination.total).toBe(0);
    });

    it('should handle database error', async () => {
      const dbError = new Error('Database connection failed');
      prisma.videoClip.findMany.mockRejectedValueOnce(dbError);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const request = new NextRequest('http://localhost:3000/api/clips');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toMatchObject({
        success: false,
        error: {
          code: 'CLIP_LIST_FAILED',
          message: 'Failed to retrieve video clips',
        },
      });

      consoleErrorSpy.mockRestore();
    });

    it('should convert dates to ISO strings', async () => {
      const mockClips = [createMockClip('clip-1')];

      prisma.videoClip.findMany.mockResolvedValueOnce(mockClips);
      prisma.videoClip.count.mockResolvedValueOnce(1);

      const request = new NextRequest('http://localhost:3000/api/clips');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.clips[0].createdAt).toBe('2025-01-01T00:00:00.000Z');
      expect(data.data.clips[0].updatedAt).toBe('2025-01-01T00:00:00.000Z');
    });
  });
});

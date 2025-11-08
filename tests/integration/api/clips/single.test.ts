import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/clips/[id]/route';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    videoClip: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Single Video Clip API Endpoint', () => {
  let prisma: any;

  beforeEach(async () => {
    const prismaModule = await import('@/lib/prisma');
    prisma = prismaModule.default;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockClip = {
    id: 'clip-123',
    title: 'Test Video Clip',
    description: 'A test video description',
    clipUrl: 'https://test-bucket.r2.dev/12345-abc.mp4',
    durationSeconds: 10,
    difficultyLevel: 'INTERMEDIATE' as const,
    subtitleText: 'This is a test subtitle for the video clip',
    difficultyWords: [
      { word: 'example', definition: 'a thing characteristic of its kind' },
      { word: 'demonstrate', definition: 'clearly show the existence of' },
    ],
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  };

  describe('GET /api/clips/[id]', () => {
    it('should return clip details when clip exists', async () => {
      prisma.videoClip.findUnique.mockResolvedValueOnce(mockClip);

      const request = new NextRequest('http://localhost:3000/api/clips/clip-123');
      const params = { id: 'clip-123' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        success: true,
        data: {
          id: 'clip-123',
          title: 'Test Video Clip',
          description: 'A test video description',
          clipUrl: 'https://test-bucket.r2.dev/12345-abc.mp4',
          durationSeconds: 10,
          difficultyLevel: 'INTERMEDIATE',
          subtitleText: 'This is a test subtitle for the video clip',
          difficultyWords: [
            { word: 'example', definition: 'a thing characteristic of its kind' },
            { word: 'demonstrate', definition: 'clearly show the existence of' },
          ],
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      });

      expect(prisma.videoClip.findUnique).toHaveBeenCalledWith({
        where: { id: 'clip-123' },
        select: expect.objectContaining({
          id: true,
          title: true,
          clipUrl: true,
          subtitleText: true,
        }),
      });
    });

    it('should return 404 when clip does not exist', async () => {
      prisma.videoClip.findUnique.mockResolvedValueOnce(null);

      const request = new NextRequest('http://localhost:3000/api/clips/nonexistent');
      const params = { id: 'nonexistent' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toMatchObject({
        success: false,
        error: {
          code: 'CLIP_NOT_FOUND',
          message: 'Video clip not found',
        },
      });
    });

    it('should return error for invalid ID format', async () => {
      const request = new NextRequest('http://localhost:3000/api/clips/');
      const params = { id: '' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        error: {
          code: 'CLIP_INVALID_ID',
          message: 'Invalid clip ID provided',
        },
      });
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection lost');
      prisma.videoClip.findUnique.mockRejectedValueOnce(dbError);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const request = new NextRequest('http://localhost:3000/api/clips/clip-123');
      const params = { id: 'clip-123' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toMatchObject({
        success: false,
        error: {
          code: 'CLIP_RETRIEVAL_FAILED',
          message: 'Failed to retrieve video clip',
        },
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Clip retrieval endpoint error:',
        dbError
      );

      consoleErrorSpy.mockRestore();
    });

    it('should return clip with null description when not provided', async () => {
      const clipWithoutDescription = {
        ...mockClip,
        description: null,
      };

      prisma.videoClip.findUnique.mockResolvedValueOnce(clipWithoutDescription);

      const request = new NextRequest('http://localhost:3000/api/clips/clip-123');
      const params = { id: 'clip-123' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.description).toBeNull();
    });

    it('should return clip with null difficulty words when not provided', async () => {
      const clipWithoutDifficultyWords = {
        ...mockClip,
        difficultyWords: null,
      };

      prisma.videoClip.findUnique.mockResolvedValueOnce(clipWithoutDifficultyWords);

      const request = new NextRequest('http://localhost:3000/api/clips/clip-123');
      const params = { id: 'clip-123' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.difficultyWords).toBeNull();
    });

    it('should convert dates to ISO strings', async () => {
      prisma.videoClip.findUnique.mockResolvedValueOnce(mockClip);

      const request = new NextRequest('http://localhost:3000/api/clips/clip-123');
      const params = { id: 'clip-123' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(typeof data.data.createdAt).toBe('string');
      expect(typeof data.data.updatedAt).toBe('string');
      expect(data.data.createdAt).toBe('2025-01-01T00:00:00.000Z');
      expect(data.data.updatedAt).toBe('2025-01-01T00:00:00.000Z');
    });

    it('should include CDN URL in response', async () => {
      prisma.videoClip.findUnique.mockResolvedValueOnce(mockClip);

      const request = new NextRequest('http://localhost:3000/api/clips/clip-123');
      const params = { id: 'clip-123' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(data.data.clipUrl).toBe('https://test-bucket.r2.dev/12345-abc.mp4');
      expect(data.data.clipUrl).toMatch(/^https:\/\//);
    });
  });
});

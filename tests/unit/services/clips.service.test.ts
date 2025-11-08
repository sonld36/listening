import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchClips, fetchClipById, ApiError } from '@/services/clips.service';
import type { ClipListResponse, ClipDetailResponse, ErrorResponse } from '@/types/api';

describe('Clips Service', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    // Save original fetch
    originalFetch = global.fetch;
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });

  describe('fetchClips', () => {
    it('should fetch clips successfully with default parameters', async () => {
      const mockResponse: ClipListResponse = {
        success: true,
        data: {
          clips: [
            {
              id: 'clip1',
              title: 'Test Clip 1',
              description: 'A test clip',
              clipUrl: 'https://cdn.example.com/clip1.mp4',
              durationSeconds: 10,
              difficultyLevel: 'BEGINNER',
              subtitleText: 'Hello world',
              difficultyWords: null,
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z',
            },
          ],
          pagination: {
            total: 1,
            limit: 10,
            offset: 0,
            hasMore: false,
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      } as any);

      const result = await fetchClips();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/clips',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
        })
      );

      expect(result).toEqual(mockResponse);
      expect(result.data.clips).toHaveLength(1);
      expect(result.data.clips[0].title).toBe('Test Clip 1');
    });

    it('should fetch clips with custom parameters', async () => {
      const mockResponse: ClipListResponse = {
        success: true,
        data: {
          clips: [],
          pagination: {
            total: 0,
            limit: 20,
            offset: 10,
            hasMore: false,
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      } as any);

      const params = { limit: 20, offset: 10, difficulty: 'ADVANCED' as const };
      await fetchClips(params);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/clips?limit=20&offset=10&difficulty=ADVANCED',
        expect.any(Object)
      );
    });

    it('should handle API error response', async () => {
      const mockErrorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'CLIP_LIST_INVALID_PARAMS',
          message: 'Invalid query parameters',
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValueOnce(mockErrorResponse),
      } as any);

      await expect(fetchClips({ limit: -1 })).rejects.toThrow(ApiError);

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValueOnce(mockErrorResponse),
      } as any);

      await expect(fetchClips({ limit: -1 })).rejects.toThrow('Invalid query parameters');

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValueOnce(mockErrorResponse),
      } as any);

      try {
        await fetchClips({ limit: -1 });
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).code).toBe('CLIP_LIST_INVALID_PARAMS');
      }
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

      await expect(fetchClips()).rejects.toThrow(ApiError);

      try {
        await fetchClips();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).code).toBe('NETWORK_ERROR');
        expect((error as ApiError).message).toBe('Network failure');
      }
    });

    it('should handle non-ok response with success:false', async () => {
      const mockErrorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'CLIP_LIST_FAILED',
          message: 'Failed to retrieve video clips',
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValueOnce(mockErrorResponse),
      } as any);

      await expect(fetchClips()).rejects.toThrow('Failed to retrieve video clips');
    });

    it('should build query string correctly with multiple params', async () => {
      const mockResponse: ClipListResponse = {
        success: true,
        data: {
          clips: [],
          pagination: { total: 0, limit: 5, offset: 15, hasMore: false },
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      } as any);

      await fetchClips({ limit: 5, offset: 15 });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/clips?limit=5&offset=15',
        expect.any(Object)
      );
    });

    it('should filter out undefined parameters', async () => {
      const mockResponse: ClipListResponse = {
        success: true,
        data: {
          clips: [],
          pagination: { total: 0, limit: 10, offset: 0, hasMore: false },
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      } as any);

      await fetchClips({ limit: undefined, offset: undefined });

      expect(global.fetch).toHaveBeenCalledWith('/api/clips', expect.any(Object));
    });
  });

  describe('fetchClipById', () => {
    it('should fetch single clip successfully', async () => {
      const mockResponse: ClipDetailResponse = {
        success: true,
        data: {
          id: 'clip1',
          title: 'Test Clip Detail',
          description: 'Detailed test clip',
          clipUrl: 'https://cdn.example.com/clip1.mp4',
          durationSeconds: 10,
          difficultyLevel: 'INTERMEDIATE',
          subtitleText: 'This is a test subtitle',
          difficultyWords: [{ word: 'test', translation: 'thử nghiệm' }],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      } as any);

      const result = await fetchClipById('clip1');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/clips/clip1',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
        })
      );

      expect(result).toEqual(mockResponse);
      expect(result.data.id).toBe('clip1');
      expect(result.data.title).toBe('Test Clip Detail');
    });

    it('should throw error for invalid ID (empty string)', async () => {
      await expect(fetchClipById('')).rejects.toThrow(ApiError);
      await expect(fetchClipById('')).rejects.toThrow('Invalid clip ID provided');

      try {
        await fetchClipById('');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).code).toBe('CLIP_INVALID_ID');
      }
    });

    it('should handle CLIP_NOT_FOUND error', async () => {
      const mockErrorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'CLIP_NOT_FOUND',
          message: 'Video clip not found',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue(mockErrorResponse),
      } as any);

      await expect(fetchClipById('nonexistent-id')).rejects.toThrow(ApiError);
      await expect(fetchClipById('nonexistent-id')).rejects.toThrow('Video clip not found');

      try {
        await fetchClipById('nonexistent-id');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).code).toBe('CLIP_NOT_FOUND');
      }
    });

    it('should handle CLIP_RETRIEVAL_FAILED error', async () => {
      const mockErrorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'CLIP_RETRIEVAL_FAILED',
          message: 'Failed to retrieve video clip',
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValueOnce(mockErrorResponse),
      } as any);

      await expect(fetchClipById('clip1')).rejects.toThrow('Failed to retrieve video clip');
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Connection timeout'));

      await expect(fetchClipById('clip1')).rejects.toThrow(ApiError);

      try {
        await fetchClipById('clip1');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).code).toBe('NETWORK_ERROR');
        expect((error as ApiError).message).toBe('Connection timeout');
      }
    });

    it('should handle error response with details field', async () => {
      const mockErrorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'CLIP_RETRIEVAL_FAILED',
          message: 'Database connection error',
          details: { dbError: 'Connection refused' },
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValueOnce(mockErrorResponse),
      } as any);

      try {
        await fetchClipById('clip1');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).details).toEqual({ dbError: 'Connection refused' });
      }
    });
  });

  describe('ApiError', () => {
    it('should create ApiError with all properties', () => {
      const error = new ApiError('TEST_CODE', 'Test message', { extra: 'info' });

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.name).toBe('ApiError');
      expect(error.code).toBe('TEST_CODE');
      expect(error.message).toBe('Test message');
      expect(error.details).toEqual({ extra: 'info' });
    });

    it('should create ApiError without details', () => {
      const error = new ApiError('TEST_CODE', 'Test message');

      expect(error.code).toBe('TEST_CODE');
      expect(error.message).toBe('Test message');
      expect(error.details).toBeUndefined();
    });
  });
});

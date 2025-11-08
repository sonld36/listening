import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useClips, useClip } from '@/hooks/useClips';
import type { ClipListResponse, ClipDetailResponse, ErrorResponse } from '@/types/api';

// Test wrapper component
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for faster tests
        gcTime: 0, // Disable garbage collection for cleaner tests
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useClips Hook Integration Tests', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('useClips', () => {
    it('should fetch clips successfully with default parameters', async () => {
      const mockResponse: ClipListResponse = {
        success: true,
        data: {
          clips: [
            {
              id: 'clip1',
              title: 'Test Clip 1',
              description: 'First test clip',
              clipUrl: 'https://cdn.example.com/clip1.mp4',
              durationSeconds: 10,
              difficultyLevel: 'BEGINNER',
              subtitleText: 'Hello world',
              difficultyWords: null,
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z',
            },
            {
              id: 'clip2',
              title: 'Test Clip 2',
              description: 'Second test clip',
              clipUrl: 'https://cdn.example.com/clip2.mp4',
              durationSeconds: 10,
              difficultyLevel: 'INTERMEDIATE',
              subtitleText: 'How are you?',
              difficultyWords: [{ word: 'you', translation: 'bạn' }],
              createdAt: '2025-01-02T00:00:00Z',
              updatedAt: '2025-01-02T00:00:00Z',
            },
          ],
          pagination: {
            total: 2,
            limit: 10,
            offset: 0,
            hasMore: false,
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useClips(), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.clips).toEqual([]);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify data
      expect(result.current.clips).toHaveLength(2);
      expect(result.current.clips[0].title).toBe('Test Clip 1');
      expect(result.current.clips[1].title).toBe('Test Clip 2');
      expect(result.current.pagination.total).toBe(2);
      expect(result.current.pagination.hasMore).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should fetch clips with custom pagination parameters', async () => {
      const mockResponse: ClipListResponse = {
        success: true,
        data: {
          clips: [],
          pagination: {
            total: 50,
            limit: 20,
            offset: 20,
            hasMore: true,
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useClips({ limit: 20, offset: 20 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/clips?limit=20&offset=20',
        expect.any(Object)
      );

      expect(result.current.pagination.limit).toBe(20);
      expect(result.current.pagination.offset).toBe(20);
      expect(result.current.pagination.hasMore).toBe(true);
    });

    it('should filter clips by difficulty level', async () => {
      const mockResponse: ClipListResponse = {
        success: true,
        data: {
          clips: [
            {
              id: 'clip1',
              title: 'Advanced Clip',
              description: null,
              clipUrl: 'https://cdn.example.com/clip1.mp4',
              durationSeconds: 10,
              difficultyLevel: 'ADVANCED',
              subtitleText: 'Complex sentence structure',
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
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useClips({ difficulty: 'ADVANCED' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/clips?difficulty=ADVANCED',
        expect.any(Object)
      );

      expect(result.current.clips).toHaveLength(1);
      expect(result.current.clips[0].difficultyLevel).toBe('ADVANCED');
    });

    it('should handle error state when API fails', async () => {
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
        json: async () => mockErrorResponse,
      });

      const { result } = renderHook(() => useClips(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeTruthy();
      expect(result.current.clips).toEqual([]);
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network failure'));

      const { result } = renderHook(() => useClips(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeTruthy();
      expect(result.current.clips).toEqual([]);
    });

    it('should provide refetch function', async () => {
      const mockResponse: ClipListResponse = {
        success: true,
        data: {
          clips: [],
          pagination: { total: 0, limit: 10, offset: 0, hasMore: false },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useClips(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Call refetch
      result.current.refetch();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('useClip', () => {
    it('should fetch single clip successfully', async () => {
      const mockResponse: ClipDetailResponse = {
        success: true,
        data: {
          id: 'clip123',
          title: 'Detailed Test Clip',
          description: 'A detailed test clip',
          clipUrl: 'https://cdn.example.com/clip123.mp4',
          durationSeconds: 10,
          difficultyLevel: 'INTERMEDIATE',
          subtitleText: 'This is a test subtitle for detailed clip',
          difficultyWords: [
            { word: 'test', translation: 'thử nghiệm' },
            { word: 'detailed', translation: 'chi tiết' },
          ],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useClip('clip123'), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.clip).toBeUndefined();

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify data
      expect(result.current.clip).toBeDefined();
      expect(result.current.clip?.id).toBe('clip123');
      expect(result.current.clip?.title).toBe('Detailed Test Clip');
      expect(result.current.clip?.difficultyWords).toHaveLength(2);
      expect(result.current.isError).toBe(false);
    });

    it('should handle CLIP_NOT_FOUND error', async () => {
      const mockErrorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'CLIP_NOT_FOUND',
          message: 'Video clip not found',
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => mockErrorResponse,
      });

      const { result } = renderHook(() => useClip('nonexistent-id'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeTruthy();
      expect(result.current.clip).toBeUndefined();
    });

    it('should not fetch when ID is empty', async () => {
      global.fetch = vi.fn();

      const { result } = renderHook(() => useClip(''), {
        wrapper: createWrapper(),
      });

      // Should not be loading since query is disabled
      expect(result.current.isLoading).toBe(false);
      expect(result.current.clip).toBeUndefined();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should respect enabled option', async () => {
      global.fetch = vi.fn();

      const { result } = renderHook(() => useClip('clip123', { enabled: false }), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.clip).toBeUndefined();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should provide refetch function', async () => {
      const mockResponse: ClipDetailResponse = {
        success: true,
        data: {
          id: 'clip123',
          title: 'Test Clip',
          description: null,
          clipUrl: 'https://cdn.example.com/clip.mp4',
          durationSeconds: 10,
          difficultyLevel: 'BEGINNER',
          subtitleText: 'Test',
          difficultyWords: null,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useClip('clip123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Call refetch
      result.current.refetch();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Connection timeout'));

      const { result } = renderHook(() => useClip('clip123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeTruthy();
      expect(result.current.clip).toBeUndefined();
    });
  });
});

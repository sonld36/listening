/**
 * TanStack Query Hooks for Video Clips
 *
 * These hooks provide React integration for fetching video clips data
 * with automatic caching, background refetching, and state management.
 *
 * Usage:
 * - useClips(): Fetch paginated list of clips with optional filtering
 * - useClip(id): Fetch single clip by ID
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchClips, fetchClipById } from '@/services/clips.service';
import type {
  ClipListResponse,
  ClipDetailResponse,
  ClipQueryParams,
  IClip,
  ClipListData,
} from '@/types/api';

// ============================================================================
// Query Key Factories
// ============================================================================

/**
 * Query key factory for clips queries
 * Following architecture pattern: [domain, action, ...params]
 */
const clipsKeys = {
  all: ['clips'] as const,
  lists: () => [...clipsKeys.all, 'list'] as const,
  list: (params: ClipQueryParams) => [...clipsKeys.lists(), params] as const,
  details: () => [...clipsKeys.all, 'detail'] as const,
  detail: (id: string) => [...clipsKeys.details(), id] as const,
};

// ============================================================================
// Hook Types
// ============================================================================

/**
 * Return type for useClips hook
 * Extends UseQueryResult with typed data and error
 */
export interface UseClipsResult {
  clips: IClip[];
  pagination: ClipListData['pagination'];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Return type for useClip hook
 * Extends UseQueryResult with typed data and error
 */
export interface UseClipResult {
  clip: IClip | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook for fetching paginated list of video clips
 *
 * Features:
 * - Automatic caching with 5-minute stale time (configured in QueryClient)
 * - Background refetch on window focus
 * - Pagination support with limit/offset
 * - Optional difficulty level filtering
 * - Retry on failure with exponential backoff
 *
 * @param params - Query parameters (limit, offset, difficulty)
 * @returns Object with clips data, pagination info, loading/error states, and refetch function
 *
 * @example
 * ```tsx
 * function ClipsList() {
 *   const { clips, pagination, isLoading, isError, error } = useClips({
 *     limit: 20,
 *     offset: 0,
 *     difficulty: 'BEGINNER'
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (isError) return <div>Error: {error?.message}</div>;
 *
 *   return (
 *     <div>
 *       {clips.map(clip => <ClipCard key={clip.id} clip={clip} />)}
 *       <Pagination {...pagination} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useClips(params: ClipQueryParams = {}): UseClipsResult {
  const query = useQuery({
    queryKey: clipsKeys.list(params),
    queryFn: () => fetchClips(params),
  });

  return {
    clips: query.data?.data.clips ?? [],
    pagination: query.data?.data.pagination ?? {
      total: 0,
      limit: params.limit ?? 10,
      offset: params.offset ?? 0,
      hasMore: false,
    },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for fetching a single video clip by ID
 *
 * Features:
 * - Automatic caching with 5-minute stale time (configured in QueryClient)
 * - Background refetch on window focus
 * - Retry on failure with exponential backoff
 * - Enabled only when ID is provided
 *
 * @param id - Video clip ID (cuid)
 * @param options - Additional query options
 * @returns Object with clip data, loading/error states, and refetch function
 *
 * @example
 * ```tsx
 * function ClipDetail({ clipId }: { clipId: string }) {
 *   const { clip, isLoading, isError, error } = useClip(clipId);
 *
 *   if (isLoading) return <div>Loading clip...</div>;
 *   if (isError) return <div>Error: {error?.message}</div>;
 *   if (!clip) return <div>Clip not found</div>;
 *
 *   return (
 *     <div>
 *       <h1>{clip.title}</h1>
 *       <video src={clip.clipUrl} />
 *       <p>{clip.subtitleText}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useClip(
  id: string,
  options?: { enabled?: boolean }
): UseClipResult {
  const query = useQuery({
    queryKey: clipsKeys.detail(id),
    queryFn: () => fetchClipById(id),
    // Only fetch if ID is provided and enabled option is not false
    enabled: Boolean(id) && (options?.enabled ?? true),
  });

  return {
    clip: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Export query keys for advanced usage (invalidation, prefetching, etc.)
 */
export { clipsKeys };

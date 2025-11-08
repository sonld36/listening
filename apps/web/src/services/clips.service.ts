/**
 * Video Clips Service Layer
 *
 * This service provides type-safe API calls for video clip management.
 * It is framework-agnostic and can be used with any React state management solution.
 *
 * Usage:
 * - fetchClips(): Retrieve paginated list of clips with optional filtering
 * - fetchClipById(): Retrieve single clip by ID
 */

import type {
  ClipListResponse,
  ClipDetailResponse,
  ClipQueryParams,
  ErrorResponse,
} from '@/types/api';

// ============================================================================
// Custom Error Class
// ============================================================================

/**
 * Custom error class for API errors
 * Extends Error to include API-specific error code
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse error response from API
 * Throws ApiError with code and message from API error response
 */
function parseErrorResponse(errorResponse: ErrorResponse): never {
  throw new ApiError(
    errorResponse.error.code,
    errorResponse.error.message,
    errorResponse.error.details
  );
}

/**
 * Build query string from parameters
 * Filters out undefined values
 */
function buildQueryString(params: ClipQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.limit !== undefined) {
    searchParams.append('limit', params.limit.toString());
  }
  if (params.offset !== undefined) {
    searchParams.append('offset', params.offset.toString());
  }
  if (params.difficulty !== undefined) {
    searchParams.append('difficulty', params.difficulty);
  }

  return searchParams.toString();
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Fetch paginated list of video clips
 *
 * @param params - Query parameters (limit, offset, difficulty)
 * @returns Promise resolving to ClipListResponse
 * @throws ApiError if request fails or returns error response
 *
 * @example
 * ```ts
 * const response = await fetchClips({ limit: 20, offset: 0, difficulty: 'BEGINNER' });
 * console.log(response.data.clips);
 * ```
 */
export async function fetchClips(
  params: ClipQueryParams = {}
): Promise<ClipListResponse> {
  try {
    const queryString = buildQueryString(params);
    const url = `/api/clips${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    });

    const json = await response.json();

    // Handle error response
    if (!response.ok || !json.success) {
      parseErrorResponse(json as ErrorResponse);
    }

    return json as ClipListResponse;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Wrap network errors in ApiError
    throw new ApiError(
      'NETWORK_ERROR',
      error instanceof Error ? error.message : 'Network request failed'
    );
  }
}

/**
 * Fetch single video clip by ID
 *
 * @param id - Video clip ID (cuid)
 * @returns Promise resolving to ClipDetailResponse
 * @throws ApiError if request fails, clip not found, or returns error response
 *
 * @example
 * ```ts
 * const response = await fetchClipById('cm2abc123xyz');
 * console.log(response.data.title);
 * ```
 */
export async function fetchClipById(id: string): Promise<ClipDetailResponse> {
  try {
    if (!id || typeof id !== 'string') {
      throw new ApiError('CLIP_INVALID_ID', 'Invalid clip ID provided');
    }

    const url = `/api/clips/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    });

    const json = await response.json();

    // Handle error response
    if (!response.ok || !json.success) {
      parseErrorResponse(json as ErrorResponse);
    }

    return json as ClipDetailResponse;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Wrap network errors in ApiError
    throw new ApiError(
      'NETWORK_ERROR',
      error instanceof Error ? error.message : 'Network request failed'
    );
  }
}

/**
 * Shared API Types for Video Clips Management
 *
 * These types define the structure of API requests and responses
 * for the video clips endpoints, ensuring type safety across the
 * frontend application.
 */

// ============================================================================
// Clip Types
// ============================================================================

/**
 * Difficulty level for video clips
 */
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

/**
 * Difficulty word entry in the difficulty_words JSON array
 */
export interface DifficultyWord {
  word: string;
  translation?: string;
  explanation?: string;
}

/**
 * Video Clip interface matching the VideoClip Prisma model
 * Field names are in camelCase to match TypeScript/JavaScript conventions
 */
export interface IClip {
  id: string;
  title: string;
  description?: string | null;
  clipUrl: string;
  durationSeconds: number;
  difficultyLevel: DifficultyLevel;
  subtitleText: string;
  difficultyWords?: DifficultyWord[] | null;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard success response wrapper
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Standard error response wrapper
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMetadata {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Clips list response data structure
 */
export interface ClipListData {
  clips: IClip[];
  pagination: PaginationMetadata;
}

/**
 * GET /api/clips response type
 */
export type ClipListResponse = SuccessResponse<ClipListData>;

/**
 * GET /api/clips/[id] response type
 */
export type ClipDetailResponse = SuccessResponse<IClip>;

// ============================================================================
// Query Parameter Types
// ============================================================================

/**
 * Query parameters for GET /api/clips
 */
export interface ClipQueryParams {
  limit?: number;
  offset?: number;
  difficulty?: DifficultyLevel;
}

// ============================================================================
// Error Code Types
// ============================================================================

/**
 * Known error codes from the clips API
 */
export type ClipErrorCode =
  | 'CLIP_LIST_INVALID_PARAMS'
  | 'CLIP_LIST_FAILED'
  | 'CLIP_INVALID_ID'
  | 'CLIP_NOT_FOUND'
  | 'CLIP_RETRIEVAL_FAILED';

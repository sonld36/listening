import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

/**
 * Video Clips List API Endpoint
 * GET /api/clips
 *
 * Returns paginated list of video clips with optional filtering
 * Public endpoint - no authentication required
 *
 * Query parameters:
 * - limit: Number of clips to return (default: 10, max: 100)
 * - offset: Number of clips to skip (default: 0)
 * - difficulty: Filter by difficulty level (BEGINNER, INTERMEDIATE, ADVANCED)
 */

// Query parameter validation schema
const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      limit: searchParams.get('limit') || '10',
      offset: searchParams.get('offset') || '0',
      difficulty: searchParams.get('difficulty') || undefined,
    };

    const validationResult = querySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CLIP_LIST_INVALID_PARAMS',
          message: 'Invalid query parameters',
          details: process.env.NODE_ENV === 'development'
            ? validationResult.error.flatten()
            : undefined,
        }
      }, { status: 400 });
    }

    const { limit, offset, difficulty } = validationResult.data;

    // Build where clause for filtering
    const whereClause = difficulty ? { difficultyLevel: difficulty } : {};

    // Fetch clips with pagination
    const [clips, totalCount] = await Promise.all([
      prisma.videoClip.findMany({
        where: whereClause,
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          description: true,
          clipUrl: true,
          durationSeconds: true,
          difficultyLevel: true,
          subtitleText: true,
          difficultyWords: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.videoClip.count({ where: whereClause }),
    ]);

    // Return success response with pagination metadata
    return NextResponse.json({
      success: true,
      data: {
        clips: clips.map(clip => ({
          ...clip,
          createdAt: clip.createdAt.toISOString(),
          updatedAt: clip.updatedAt.toISOString(),
        })),
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Clips list endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'CLIP_LIST_FAILED',
        message: 'Failed to retrieve video clips',
        details: process.env.NODE_ENV === 'development'
          ? (error as Error).message
          : undefined,
      }
    }, { status: 500 });
  }
}

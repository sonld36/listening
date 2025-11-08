import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Single Video Clip API Endpoint
 * GET /api/clips/[id]
 *
 * Returns details of a single video clip by ID
 * Public endpoint - no authentication required
 *
 * Path parameters:
 * - id: Video clip ID (cuid)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID is provided
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CLIP_INVALID_ID',
          message: 'Invalid clip ID provided',
        }
      }, { status: 400 });
    }

    // Fetch clip from database
    const clip = await prisma.videoClip.findUnique({
      where: { id },
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
    });

    // Handle clip not found
    if (!clip) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CLIP_NOT_FOUND',
          message: 'Video clip not found',
        }
      }, { status: 404 });
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        ...clip,
        createdAt: clip.createdAt.toISOString(),
        updatedAt: clip.updatedAt.toISOString(),
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Clip retrieval endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'CLIP_RETRIEVAL_FAILED',
        message: 'Failed to retrieve video clip',
        details: process.env.NODE_ENV === 'development'
          ? (error as Error).message
          : undefined,
      }
    }, { status: 500 });
  }
}

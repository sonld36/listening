import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import r2Client from '@/lib/r2-client';

/**
 * Video Upload API Endpoint
 * POST /api/clips/upload
 *
 * Accepts multipart/form-data with video file and metadata
 * Validates file, uploads to R2, stores metadata in database
 *
 * Required authentication via NextAuth middleware
 */

// File validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['video/mp4', 'video/webm'];
const ALLOWED_EXTENSIONS = ['.mp4', '.webm'];

// Validation schema for upload metadata
const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  difficultyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  subtitleText: z.string().min(1, 'Subtitle text is required'),
  difficultyWords: z.string().optional(), // JSON string, will be parsed
});

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();

    // Extract file
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CLIP_UPLOAD_MISSING_FILE',
          message: 'No video file provided',
        }
      }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CLIP_UPLOAD_INVALID_FORMAT',
          message: `Invalid file format. Allowed formats: ${ALLOWED_MIME_TYPES.join(', ')}`,
        }
      }, { status: 400 });
    }

    // Validate file extension
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CLIP_UPLOAD_INVALID_FORMAT',
          message: `Invalid file extension. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`,
        }
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CLIP_UPLOAD_FILE_TOO_LARGE',
          message: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        }
      }, { status: 400 });
    }

    // Extract and validate metadata
    const metadata = {
      title: formData.get('title') as string,
      description: formData.get('description') as string | null,
      difficultyLevel: formData.get('difficultyLevel') as string,
      subtitleText: formData.get('subtitleText') as string,
      difficultyWords: formData.get('difficultyWords') as string | null,
    };

    // Validate metadata with Zod
    const validationResult = uploadSchema.safeParse(metadata);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CLIP_UPLOAD_INVALID_METADATA',
          message: 'Invalid metadata provided',
          details: process.env.NODE_ENV === 'development'
            ? validationResult.error.flatten()
            : undefined,
        }
      }, { status: 400 });
    }

    const validatedData = validationResult.data;

    // Parse difficulty words if provided
    let parsedDifficultyWords = null;
    if (validatedData.difficultyWords) {
      try {
        parsedDifficultyWords = JSON.parse(validatedData.difficultyWords);
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'CLIP_UPLOAD_INVALID_DIFFICULTY_WORDS',
            message: 'Invalid JSON format for difficulty words',
          }
        }, { status: 400 });
      }
    }

    // Generate unique filename for R2 storage
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const uniqueFilename = `${timestamp}-${randomString}${fileExtension}`;

    // Convert file to buffer for R2 upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    let clipUrl: string;
    try {
      clipUrl = await r2Client.uploadFile(buffer, uniqueFilename, file.type);
    } catch (error) {
      console.error('R2 upload failed:', error);
      return NextResponse.json({
        success: false,
        error: {
          code: 'CLIP_UPLOAD_STORAGE_FAILED',
          message: 'Failed to upload video to storage',
          details: process.env.NODE_ENV === 'development'
            ? (error as Error).message
            : undefined,
        }
      }, { status: 500 });
    }

    // Store metadata in database
    try {
      const videoClip = await prisma.videoClip.create({
        data: {
          title: validatedData.title,
          description: validatedData.description || null,
          clipUrl,
          durationSeconds: 10, // Default for all clips
          difficultyLevel: validatedData.difficultyLevel as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
          subtitleText: validatedData.subtitleText,
          difficultyWords: parsedDifficultyWords,
        },
      });

      // Return success response
      return NextResponse.json({
        success: true,
        data: {
          id: videoClip.id,
          title: videoClip.title,
          description: videoClip.description,
          clipUrl: videoClip.clipUrl,
          durationSeconds: videoClip.durationSeconds,
          difficultyLevel: videoClip.difficultyLevel,
          subtitleText: videoClip.subtitleText,
          difficultyWords: videoClip.difficultyWords,
          createdAt: videoClip.createdAt.toISOString(),
          updatedAt: videoClip.updatedAt.toISOString(),
        }
      }, { status: 201 });

    } catch (error) {
      // Database insert failed - attempt to clean up R2 upload
      console.error('Database insert failed:', error);

      try {
        await r2Client.deleteFile(uniqueFilename);
      } catch (cleanupError) {
        console.error('Failed to cleanup R2 file after database error:', cleanupError);
      }

      return NextResponse.json({
        success: false,
        error: {
          code: 'CLIP_UPLOAD_DATABASE_FAILED',
          message: 'Failed to save video metadata',
          details: process.env.NODE_ENV === 'development'
            ? (error as Error).message
            : undefined,
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Upload endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'CLIP_UPLOAD_FAILED',
        message: 'Unexpected error during upload',
        details: process.env.NODE_ENV === 'development'
          ? (error as Error).message
          : undefined,
      }
    }, { status: 500 });
  }
}

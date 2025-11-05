import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Health check endpoint to verify application and database status
 * GET /api/health
 *
 * Returns:
 * - 200 OK with success response if everything is healthy
 * - 500 Internal Server Error if database is not connected
 */
export async function GET() {
  try {
    // Test database connection by running a simple query
    // This will throw an error if the database is not connected
    await prisma.$queryRaw`SELECT 1`;

    // If we get here, the database is connected
    return NextResponse.json({
      success: true,
      data: {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      }
    }, { status: 200 });

  } catch (error) {
    // Database connection failed
    console.error('Health check failed:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Database connection failed',
        details: process.env.NODE_ENV === 'development'
          ? (error as Error).message
          : undefined
      }
    }, { status: 500 });
  }
}
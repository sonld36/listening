import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { signupSchema } from '@/lib/validation/auth.schema';

/**
 * User registration endpoint
 * POST /api/auth/register
 *
 * Request body:
 * - email: string (RFC 5322 compliant)
 * - password: string (min 8 chars, 1 uppercase, 1 number)
 *
 * Returns:
 * - 201 Created with user data on success
 * - 400 Bad Request for validation errors
 * - 409 Conflict for duplicate email
 * - 500 Internal Server Error for server errors
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input with Zod
    const validationResult = signupSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_INVALID_INPUT',
            message: 'Invalid input data',
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Hash password with bcrypt (12 rounds per architecture)
    const passwordHash = await hashPassword(password);

    // Create user in database
    try {
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              createdAt: user.createdAt.toISOString(),
            },
            message: 'Account created successfully',
          },
        },
        { status: 201 }
      );
    } catch (error) {
      // Handle Prisma unique constraint violation (duplicate email)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'AUTH_EMAIL_EXISTS',
                message: 'An account with this email already exists',
              },
            },
            { status: 409 }
          );
        }
      }

      // Re-throw other database errors
      throw error;
    }
  } catch (error) {
    console.error('Registration error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AUTH_REGISTRATION_FAILED',
          message: 'Registration failed. Please try again.',
          details:
            process.env.NODE_ENV === 'development'
              ? (error as Error).message
              : undefined,
        },
      },
      { status: 500 }
    );
  }
}

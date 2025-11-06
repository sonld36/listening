import { withAuth } from 'next-auth/middleware';

/**
 * Middleware configuration
 * Protects routes that require authentication
 *
 * Protected routes: /dashboard, /learn, /flashcards
 * Public routes: /, /login, /signup, /api/auth/*
 */
export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/learn/:path*',
    '/flashcards/:path*',
  ],
};

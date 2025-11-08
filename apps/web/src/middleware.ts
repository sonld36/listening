import { withAuth } from 'next-auth/middleware';

/**
 * Middleware configuration
 * Protects routes that require authentication
 *
 * Protected routes: /dashboard, /learn, /flashcards, /api/clips/upload
 * Public routes: /, /login, /signup, /api/auth/*, /api/clips (GET)
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
    '/api/clips/upload/:path*',
  ],
};

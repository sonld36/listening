import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { loginSchema } from '@/lib/validation/auth.schema';
import { verifyPassword } from '@/lib/auth/password';
import prisma from '@/lib/prisma';

/**
 * NextAuth configuration
 * - Credentials provider for email/password authentication
 * - JWT session strategy with 30-day expiry
 * - Custom pages for sign in and sign up
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          const validationResult = loginSchema.safeParse(credentials);

          if (!validationResult.success) {
            return null;
          }

          const { email, password } = validationResult.data;

          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            return null;
          }

          // Verify password
          const isValidPassword = await verifyPassword(
            password,
            user.passwordHash
          );

          if (!isValidPassword) {
            return null;
          }

          // Return user object (will be encoded in JWT)
          return {
            id: user.id,
            email: user.email,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    // signUp page is custom, not handled by NextAuth
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user info to token on sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info from token to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

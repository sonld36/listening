# Security Architecture

## Authentication & Authorization
- NextAuth.js with JWT sessions
- Password hashing with bcrypt (12 rounds)
- Session expiry: 30 days
- Refresh token rotation

## Data Protection
- HTTPS everywhere (enforced by Vercel)
- Environment variables for secrets
- Prisma parameterized queries (SQL injection prevention)
- Input validation with Zod schemas

## API Security
- Rate limiting on auth endpoints (5 attempts/minute)
- CORS configured for production domain only
- API routes require authentication (except public clips list)

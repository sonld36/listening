import { PrismaClient } from '@prisma/client';

// Declare a global variable to store the Prisma client instance
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create a singleton instance of the Prisma client
// This prevents multiple instances from being created during development
// when Next.js performs hot reloading
const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// In development, save the Prisma client to the global object
// This ensures the same instance is reused across hot reloads
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
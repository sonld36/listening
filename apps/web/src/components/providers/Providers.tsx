'use client';

import { SessionProvider } from 'next-auth/react';
import { SessionSyncProvider } from './SessionSyncProvider';

/**
 * Root providers for the application
 * - SessionProvider: NextAuth session context
 * - SessionSyncProvider: Syncs NextAuth session with Zustand store
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSyncProvider>{children}</SessionSyncProvider>
    </SessionProvider>
  );
}

'use client';

import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionSyncProvider } from './SessionSyncProvider';

/**
 * Root providers for the application
 * - QueryClientProvider: TanStack Query for server state management
 * - SessionProvider: NextAuth session context
 * - SessionSyncProvider: Syncs NextAuth session with Zustand store
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient with recommended settings
  // Using useState to ensure QueryClient is only created once per component mount
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 5 minutes
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Background refetch on window focus
            refetchOnWindowFocus: true,
            // Retry failed requests 3 times with exponential backoff
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SessionSyncProvider>{children}</SessionSyncProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

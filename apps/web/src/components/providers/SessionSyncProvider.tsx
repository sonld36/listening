'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useAuth } from '@/stores/authStore';

/**
 * SessionSyncProvider
 * Syncs NextAuth session with Zustand auth store
 * This ensures client-side state consistency with server session
 */
export function SessionSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const { setUser, clearUser } = useAuth();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Sync authenticated user to Zustand store
      setUser({
        id: session.user.id,
        email: session.user.email,
      });
    } else if (status === 'unauthenticated') {
      // Clear Zustand store when session is cleared
      clearUser();
    }
  }, [session, status, setUser, clearUser]);

  return <>{children}</>;
}

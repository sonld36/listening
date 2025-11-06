'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/authStore';

interface LogoutButtonProps {
  className?: string;
  variant?: 'button' | 'link';
}

/**
 * Logout button component
 * - Calls NextAuth signOut
 * - Clears Zustand auth store
 * - Redirects to login page
 */
export function LogoutButton({
  className = '',
  variant = 'button',
}: LogoutButtonProps) {
  const router = useRouter();
  const { clearUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Clear client state
      clearUser();

      // Sign out from NextAuth
      await signOut({
        redirect: false,
      });

      // Redirect to login
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const baseClasses = variant === 'button'
    ? 'px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    : 'focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = variant === 'button'
    ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    : 'text-gray-700 hover:text-red-600';

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  );
}

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import DashboardPage from '@/app/(app)/dashboard/page';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  usePathname: () => '/dashboard',
}));

// Mock AppNav component
vi.mock('@/components/layout/AppNav', () => ({
  AppNav: () => <nav data-testid="app-nav">AppNav</nav>,
}));

describe('Dashboard Session Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Session Data Integration', () => {
    it('integrates with NextAuth session provider', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'integration@test.com',
          created_at: new Date().toISOString(),
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };

      render(
        <SessionProvider session={mockSession}>
          <DashboardPage />
        </SessionProvider>
      );

      // Wait for session to be loaded
      await waitFor(() => {
        expect(screen.getByText('Welcome back, integration!')).toBeInTheDocument();
      });
    });

    it('handles session expiration gracefully', async () => {
      const expiredSession = {
        user: {
          email: 'expired@test.com',
        },
        expires: new Date(Date.now() - 1000).toISOString(), // Expired
      };

      render(
        <SessionProvider session={expiredSession}>
          <DashboardPage />
        </SessionProvider>
      );

      // Should still render content (NextAuth handles refresh)
      await waitFor(() => {
        expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
      });
    });

    it('extracts and displays correct user information from session', async () => {
      const testCases = [
        {
          email: 'alice.smith@company.com',
          expectedName: 'alice.smith',
        },
        {
          email: 'bob+tag@example.org',
          expectedName: 'bob+tag',
        },
        {
          email: 'charlie123@mail.co.uk',
          expectedName: 'charlie123',
        },
      ];

      for (const testCase of testCases) {
        const session = {
          user: { email: testCase.email },
          expires: new Date(Date.now() + 86400000).toISOString(),
        };

        const { unmount } = render(
          <SessionProvider session={session}>
            <DashboardPage />
          </SessionProvider>
        );

        await waitFor(() => {
          expect(
            screen.getByText(`Welcome back, ${testCase.expectedName}!`)
          ).toBeInTheDocument();
        });

        unmount();
      }
    });
  });

  describe('Middleware Protection Integration', () => {
    it('redirects unauthenticated users to login', async () => {
      render(
        <SessionProvider session={null}>
          <DashboardPage />
        </SessionProvider>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('does not render dashboard content for unauthenticated users', async () => {
      const { container } = render(
        <SessionProvider session={null}>
          <DashboardPage />
        </SessionProvider>
      );

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });

  describe('Logout Flow Integration', () => {
    it('maintains session state throughout dashboard interaction', async () => {
      const session = {
        user: { email: 'persistent@test.com' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };

      const { rerender } = render(
        <SessionProvider session={session}>
          <DashboardPage />
        </SessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Welcome back, persistent!')).toBeInTheDocument();
      });

      // Rerender to simulate React lifecycle
      rerender(
        <SessionProvider session={session}>
          <DashboardPage />
        </SessionProvider>
      );

      // Session should still be present
      expect(screen.getByText('Welcome back, persistent!')).toBeInTheDocument();
    });
  });

  describe('Loading State Integration', () => {
    it('shows loading state before session is available', () => {
      // SessionProvider with no session initially
      render(
        <SessionProvider session={undefined}>
          <DashboardPage />
        </SessionProvider>
      );

      // Loading state should appear
      expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument();
    });
  });

  describe('Session Data Completeness', () => {
    it('handles minimal session data', async () => {
      const minimalSession = {
        user: {
          email: 'minimal@test.com',
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };

      render(
        <SessionProvider session={minimalSession}>
          <DashboardPage />
        </SessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Welcome back, minimal!')).toBeInTheDocument();
      });
    });

    it('handles session with additional fields', async () => {
      const extendedSession = {
        user: {
          id: 'user-456',
          email: 'extended@test.com',
          name: 'Extended User',
          image: 'https://example.com/avatar.jpg',
          created_at: new Date().toISOString(),
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };

      render(
        <SessionProvider session={extendedSession}>
          <DashboardPage />
        </SessionProvider>
      );

      await waitFor(() => {
        // Should extract username from email, not use 'name' field
        expect(screen.getByText('Welcome back, extended!')).toBeInTheDocument();
      });
    });

    it('gracefully handles missing email in session', async () => {
      const noEmailSession = {
        user: {},
        expires: new Date(Date.now() + 86400000).toISOString(),
      };

      render(
        <SessionProvider session={noEmailSession}>
          <DashboardPage />
        </SessionProvider>
      );

      await waitFor(() => {
        // Falls back to 'User'
        expect(screen.getByText('Welcome back, User!')).toBeInTheDocument();
      });
    });
  });
});

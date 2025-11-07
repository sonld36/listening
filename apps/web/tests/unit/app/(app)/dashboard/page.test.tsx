import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardPage from '@/app/(app)/dashboard/page';

// Mock Next.js hooks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/dashboard'),
}));

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock AppNav component
vi.mock('@/components/layout/AppNav', () => ({
  AppNav: () => <nav data-testid="app-nav">AppNav Component</nav>,
}));

describe('Dashboard Page', () => {
  const mockRouter = {
    push: vi.fn(),
    refresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
  });

  describe('Loading State', () => {
    it('displays loading spinner when session is loading', () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        status: 'loading',
      });

      render(<DashboardPage />);

      expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument();
      // Check for spinner element
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('uses green color for loading spinner', () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        status: 'loading',
      });

      render(<DashboardPage />);

      const spinner = document.querySelector('.border-green-600');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Unauthenticated State', () => {
    it('redirects to login when unauthenticated', async () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/login');
      });
    });

    it('renders nothing while redirecting', () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { container } = render(<DashboardPage />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Authenticated State', () => {
    const mockSession = {
      user: {
        id: '123',
        email: 'john.doe@example.com',
        created_at: new Date().toISOString(),
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    };

    beforeEach(() => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });
    });

    it('renders navigation component', () => {
      render(<DashboardPage />);
      expect(screen.getByTestId('app-nav')).toBeInTheDocument();
    });

    it('displays personalized welcome message with username from email', () => {
      render(<DashboardPage />);

      const userName = 'john.doe'; // Extracted from email
      expect(screen.getByText(`Welcome back, ${userName}!`)).toBeInTheDocument();
    });

    it('shows motivational subtitle', () => {
      render(<DashboardPage />);
      expect(
        screen.getByText('Ready to continue your English learning journey?')
      ).toBeInTheDocument();
    });

    it('displays Quick Actions section', () => {
      render(<DashboardPage />);
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('renders all three quick action cards', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Start Learning')).toBeInTheDocument();
      expect(screen.getByText('Review Flashcards')).toBeInTheDocument();
      expect(screen.getByText('View Progress')).toBeInTheDocument();
    });

    it('marks quick action cards as "Coming Soon"', () => {
      render(<DashboardPage />);

      const comingSoonBadges = screen.getAllByText('(Coming Soon)');
      expect(comingSoonBadges).toHaveLength(3);
    });

    it('displays empty state section with roadmap', () => {
      render(<DashboardPage />);

      expect(
        screen.getByText('Your Learning Hub is Almost Ready')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Interactive dictation exercises with 10-second clips/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Smart vocabulary flashcard system/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Progress tracking and daily streaks/i)
      ).toBeInTheDocument();
    });

    it('applies responsive grid layout to quick actions', () => {
      const { container } = render(<DashboardPage />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });

    it('uses green color scheme throughout', () => {
      const { container } = render(<DashboardPage />);

      // Check for green styling
      expect(container.innerHTML).toContain('green-50');
      expect(container.innerHTML).toContain('green-100');
      expect(container.innerHTML).toContain('green-200');
      expect(container.innerHTML).toContain('green-300');
    });
  });

  describe('User Information Display', () => {
    it('handles user email correctly', () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          user: { email: 'test.user@company.com' },
        },
        status: 'authenticated',
      });

      render(<DashboardPage />);

      expect(screen.getByText('Welcome back, test.user!')).toBeInTheDocument();
    });

    it('falls back to "User" when email is missing', () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          user: {},
        },
        status: 'authenticated',
      });

      render(<DashboardPage />);

      expect(screen.getByText('Welcome back, User!')).toBeInTheDocument();
    });

    it('extracts username correctly from various email formats', () => {
      const testCases = [
        { email: 'simple@test.com', expected: 'simple' },
        { email: 'first.last@company.co.uk', expected: 'first.last' },
        { email: 'user+tag@example.com', expected: 'user+tag' },
      ];

      testCases.forEach(({ email, expected }) => {
        (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
          data: { user: { email } },
          status: 'authenticated',
        });

        const { rerender } = render(<DashboardPage />);
        expect(screen.getByText(`Welcome back, ${expected}!`)).toBeInTheDocument();
        rerender(<></>);
      });
    });
  });

  describe('Quick Action Cards', () => {
    beforeEach(() => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
      });
    });

    it('renders correct icons for each action', () => {
      render(<DashboardPage />);

      expect(screen.getByText('🎬')).toBeInTheDocument(); // Learn
      expect(screen.getByText('📚')).toBeInTheDocument(); // Flashcards
      expect(screen.getByText('📈')).toBeInTheDocument(); // Progress
    });

    it('displays descriptions for each action', () => {
      render(<DashboardPage />);

      expect(
        screen.getByText('Practice English with 10-second Friends clips')
      ).toBeInTheDocument();
      expect(screen.getByText('Study your saved vocabulary words')).toBeInTheDocument();
      expect(
        screen.getByText('Track your learning statistics and streaks')
      ).toBeInTheDocument();
    });

    it('disables action cards with correct styling', () => {
      const { container } = render(<DashboardPage />);

      const cards = container.querySelectorAll('.opacity-60.cursor-not-allowed');
      expect(cards.length).toBe(3); // All three cards should be disabled
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
      });
    });

    it('applies mobile-first responsive classes', () => {
      const { container } = render(<DashboardPage />);

      expect(container.innerHTML).toContain('sm:px-6');
      expect(container.innerHTML).toContain('lg:px-8');
      expect(container.innerHTML).toContain('sm:text-4xl');
      expect(container.innerHTML).toContain('sm:text-lg');
    });

    it('uses responsive text sizing', () => {
      const { container } = render(<DashboardPage />);

      const h1 = container.querySelector('h1');
      expect(h1).toHaveClass('text-3xl', 'sm:text-4xl');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
      });
    });

    it('uses semantic HTML elements', () => {
      const { container } = render(<DashboardPage />);

      expect(container.querySelector('main')).toBeInTheDocument();
      expect(container.querySelector('section')).toBeInTheDocument();
      expect(container.querySelector('h1')).toBeInTheDocument();
      expect(container.querySelector('h2')).toBeInTheDocument();
    });

    it('marks decorative icons with aria-hidden', () => {
      const { container } = render(<DashboardPage />);

      const decorativeIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(decorativeIcons.length).toBeGreaterThan(0);
    });
  });
});

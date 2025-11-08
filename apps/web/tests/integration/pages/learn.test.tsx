import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LearnPage from '@/app/(app)/learn/[clipId]/page';

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
  usePathname: vi.fn(() => '/learn/clip123'),
}));

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock AppNav component
vi.mock('@/components/layout/AppNav', () => ({
  AppNav: () => <nav data-testid="app-nav">App Navigation</nav>,
}));

// Mock VideoPlayer component (already tested separately)
vi.mock('@/components/video/VideoPlayer', () => ({
  VideoPlayer: ({ clipId }: { clipId: string }) => (
    <div data-testid="video-player" data-clip-id={clipId}>
      Video Player Component
    </div>
  ),
}));

describe('LearnPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  describe('Authentication Flow', () => {
    it('shows loading state while checking authentication', () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        status: 'loading',
      });

      render(<LearnPage params={{ clipId: 'clip123' }} />);

      expect(screen.getByText(/loading learning interface/i)).toBeInTheDocument();
      expect(screen.queryByTestId('video-player')).not.toBeInTheDocument();
    });

    it('redirects to login when user is unauthenticated', async () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      render(<LearnPage params={{ clipId: 'clip123' }} />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('does not redirect when user is authenticated', () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
      });

      render(<LearnPage params={{ clipId: 'clip123' }} />);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('renders page content for authenticated users', () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
      });

      render(<LearnPage params={{ clipId: 'clip123' }} />);

      expect(screen.getByTestId('app-nav')).toBeInTheDocument();
      expect(screen.getByTestId('video-player')).toBeInTheDocument();
    });
  });

  describe('Page Layout', () => {
    beforeEach(() => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
      });
    });

    it('renders navigation bar', () => {
      render(<LearnPage params={{ clipId: 'clip123' }} />);
      expect(screen.getByTestId('app-nav')).toBeInTheDocument();
    });

    it('renders video player with correct clipId', () => {
      render(<LearnPage params={{ clipId: 'clip456' }} />);

      const videoPlayer = screen.getByTestId('video-player');
      expect(videoPlayer).toBeInTheDocument();
      expect(videoPlayer).toHaveAttribute('data-clip-id', 'clip456');
    });

    it('renders back to dashboard button', () => {
      render(<LearnPage params={{ clipId: 'clip123' }} />);
      expect(screen.getByText(/back to dashboard/i)).toBeInTheDocument();
    });

    it('navigates to dashboard when back button is clicked', () => {
      render(<LearnPage params={{ clipId: 'clip123' }} />);

      const backButton = screen.getByText(/back to dashboard/i);
      backButton.click();

      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Route Parameters', () => {
    beforeEach(() => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
      });
    });

    it('passes clipId from route params to VideoPlayer', () => {
      render(<LearnPage params={{ clipId: 'abc123' }} />);

      const videoPlayer = screen.getByTestId('video-player');
      expect(videoPlayer).toHaveAttribute('data-clip-id', 'abc123');
    });

    it('handles different clipId values', () => {
      const { rerender } = render(<LearnPage params={{ clipId: 'clip1' }} />);
      expect(screen.getByTestId('video-player')).toHaveAttribute('data-clip-id', 'clip1');

      rerender(<LearnPage params={{ clipId: 'clip2' }} />);
      expect(screen.getByTestId('video-player')).toHaveAttribute('data-clip-id', 'clip2');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
      });
    });

    it('applies responsive container classes', () => {
      const { container } = render(<LearnPage params={{ clipId: 'clip123' }} />);

      expect(container.innerHTML).toContain('max-w-7xl');
      expect(container.innerHTML).toContain('px-4 sm:px-6 lg:px-8');
    });

    it('applies responsive padding to video container', () => {
      const { container } = render(<LearnPage params={{ clipId: 'clip123' }} />);

      expect(container.innerHTML).toContain('p-4 sm:p-6 lg:p-8');
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner during authentication check', () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        status: 'loading',
      });

      const { container } = render(<LearnPage params={{ clipId: 'clip123' }} />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(screen.getByText(/loading learning interface/i)).toBeInTheDocument();
    });

    it('shows nothing while redirecting to login', () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { container } = render(<LearnPage params={{ clipId: 'clip123' }} />);

      // Should return null (no content) before redirect
      expect(container.querySelector('nav')).not.toBeInTheDocument();
      expect(screen.queryByTestId('video-player')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing session gracefully', () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        status: 'authenticated', // Edge case: authenticated but no session data
      });

      const { container } = render(<LearnPage params={{ clipId: 'clip123' }} />);

      // Should return null for safety
      expect(container.querySelector('nav')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
      });
    });

    it('uses semantic HTML main element', () => {
      const { container } = render(<LearnPage params={{ clipId: 'clip123' }} />);
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    it('has proper button semantics for back button', () => {
      render(<LearnPage params={{ clipId: 'clip123' }} />);
      const backButton = screen.getByText(/back to dashboard/i);
      expect(backButton.tagName).toBe('BUTTON');
    });
  });
});

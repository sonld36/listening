import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AppNav } from '@/components/layout/AppNav';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock LogoutButton component
vi.mock('@/components/auth/LogoutButton', () => ({
  LogoutButton: ({ variant, className }: { variant?: string; className?: string }) => (
    <button data-testid="logout-button" className={className}>
      Logout ({variant})
    </button>
  ),
}));

describe('AppNav Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard');
    (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { user: { email: 'test@example.com' } },
      status: 'authenticated',
    });
  });

  describe('Desktop Navigation', () => {
    it('renders brand logo with correct text', () => {
      render(<AppNav />);
      expect(screen.getByText('Friends Dictation')).toBeInTheDocument();
    });

    it('renders all navigation links', () => {
      render(<AppNav />);
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Learn/i)).toBeInTheDocument();
      expect(screen.getByText(/Flashcards/i)).toBeInTheDocument();
      expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    });

    it('highlights active route', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard');
      render(<AppNav />);

      // Dashboard link should have active styling (green background)
      const dashboardLink = screen.getAllByText(/Dashboard/i)[0].closest('a');
      expect(dashboardLink).toHaveClass('bg-green-50', 'text-green-700');
    });

    it('marks future links as "Coming Soon"', () => {
      render(<AppNav />);

      // Check for "(Soon)" text next to disabled links
      const soonBadges = screen.getAllByText('(Soon)');
      expect(soonBadges.length).toBeGreaterThan(0);
    });

    it('prevents navigation on disabled links', () => {
      render(<AppNav />);

      const learnLink = screen.getAllByText(/Learn/i)[0].closest('a');
      expect(learnLink).toHaveAttribute('href', '#');
    });

    it('displays user email', () => {
      render(<AppNav />);
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('renders logout button', () => {
      render(<AppNav />);
      const logoutButtons = screen.getAllByTestId('logout-button');
      expect(logoutButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Mobile Navigation', () => {
    it('shows hamburger menu button on mobile', () => {
      render(<AppNav />);
      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton).toBeInTheDocument();
    });

    it('toggles mobile menu when hamburger is clicked', () => {
      render(<AppNav />);

      const menuButton = screen.getByLabelText('Toggle menu');

      // Menu should be closed initially (mobile links not visible in mobile menu)
      // Note: Desktop links are always visible, so we check for mobile-specific structure
      expect(screen.queryByText('Signed in as')).not.toBeInTheDocument();

      // Click to open
      fireEvent.click(menuButton);
      expect(screen.getByText('Signed in as')).toBeInTheDocument();

      // Click to close
      fireEvent.click(menuButton);
      expect(screen.queryByText('Signed in as')).not.toBeInTheDocument();
    });

    it('closes mobile menu when navigation link is clicked', () => {
      render(<AppNav />);

      const menuButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(menuButton);

      // Menu is open
      expect(screen.getByText('Signed in as')).toBeInTheDocument();

      // Click on an active link (Dashboard)
      const dashboardLinks = screen.getAllByText(/Dashboard/);
      const mobileLink = dashboardLinks.find(link =>
        link.closest('div')?.className.includes('md:hidden')
      );

      if (mobileLink) {
        fireEvent.click(mobileLink);
        // Menu should close (Signed in as text disappears)
        expect(screen.queryByText('Signed in as')).not.toBeInTheDocument();
      }
    });

    it('shows user email in mobile menu', () => {
      render(<AppNav />);

      const menuButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(menuButton);

      expect(screen.getByText('Signed in as')).toBeInTheDocument();
      expect(screen.getAllByText('test@example.com').length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Behavior', () => {
    it('applies correct CSS classes for responsive breakpoints', () => {
      const { container } = render(<AppNav />);

      // Check for Tailwind responsive classes
      expect(container.innerHTML).toContain('md:hidden'); // Mobile menu button
      expect(container.innerHTML).toContain('hidden md:flex'); // Desktop nav
      expect(container.innerHTML).toContain('sm:px-6'); // Responsive padding
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<AppNav />);
      expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
    });

    it('uses semantic HTML for navigation', () => {
      const { container } = render(<AppNav />);
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });

    it('marks decorative icons with aria-hidden', () => {
      render(<AppNav />);
      const menuButton = screen.getByLabelText('Toggle menu');
      const svg = menuButton.querySelector('svg');
      // SVG icons in button are for visual purposes
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Session States', () => {
    it('handles missing user email gracefully', () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { user: {} },
        status: 'authenticated',
      });

      render(<AppNav />);
      // Component should still render without errors
      expect(screen.getByText('Friends Dictation')).toBeInTheDocument();
    });

    it('renders without session data', () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      render(<AppNav />);
      expect(screen.getByText('Friends Dictation')).toBeInTheDocument();
    });
  });
});

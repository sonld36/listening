import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Dashboard Feature
 * Tests the complete user journey: login → dashboard → logout
 *
 * Prerequisites:
 * - Database should be seeded with test user
 * - Test user credentials: test@example.com / password123
 */

test.describe('Dashboard E2E', () => {
  test.describe('Authentication Flow', () => {
    test('redirects unauthenticated users to login page', async ({ page }) => {
      // Try to access dashboard directly without authentication
      await page.goto('/dashboard');

      // Should be redirected to login
      await expect(page).toHaveURL(/.*login/);
    });

    test('redirects to dashboard after successful login', async ({ page }) => {
      // Navigate to login page
      await page.goto('/login');

      // Fill in login form
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/.*dashboard/);

      // Verify dashboard content is visible
      await expect(page.locator('text=Welcome back')).toBeVisible();
    });
  });

  test.describe('Dashboard Content', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/login');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard/);
    });

    test('displays user information correctly', async ({ page }) => {
      // Check for personalized welcome message
      await expect(page.locator('h1')).toContainText('Welcome back');

      // User email should be extracted and displayed
      await expect(page.locator('text=/test/')).toBeVisible();
    });

    test('displays navigation menu with all links', async ({ page }) => {
      // Check for navigation links
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('text=Learn')).toBeVisible();
      await expect(page.locator('text=Flashcards')).toBeVisible();
      await expect(page.locator('text=Profile')).toBeVisible();
    });

    test('highlights active navigation link', async ({ page }) => {
      // Dashboard should be highlighted (has green background class)
      const dashboardLink = page.locator('a:has-text("Dashboard")').first();
      const classList = await dashboardLink.getAttribute('class');

      expect(classList).toContain('bg-green');
    });

    test('marks future features as "Coming Soon"', async ({ page }) => {
      // Check for "Coming Soon" or "Soon" badges
      const comingSoonBadges = page.locator('text=/\\(.*Soon.*\\)/i');
      const count = await comingSoonBadges.count();

      expect(count).toBeGreaterThan(0);
    });

    test('displays quick action cards', async ({ page }) => {
      // Verify all three quick action cards are present
      await expect(page.locator('text=Start Learning')).toBeVisible();
      await expect(page.locator('text=Review Flashcards')).toBeVisible();
      await expect(page.locator('text=View Progress')).toBeVisible();
    });

    test('displays empty state section', async ({ page }) => {
      await expect(
        page.locator('text=Your Learning Hub is Almost Ready')
      ).toBeVisible();
      await expect(
        page.locator('text=/Interactive dictation exercises/i')
      ).toBeVisible();
    });

    test('logout button is visible', async ({ page }) => {
      // Desktop logout button
      const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")');
      await expect(logoutButton.first()).toBeVisible();
    });
  });

  test.describe('Logout Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/login');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard/);
    });

    test('logs out user and redirects to login', async ({ page }) => {
      // Click logout button
      const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
      await logoutButton.click();

      // Should redirect to login page
      await expect(page).toHaveURL(/.*login/);
    });

    test('dashboard is inaccessible after logout', async ({ page }) => {
      // Logout
      const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
      await logoutButton.click();
      await page.waitForURL(/.*login/);

      // Try to access dashboard again
      await page.goto('/dashboard');

      // Should be redirected back to login
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test.describe('Responsive Design', () => {
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard/);
    });

    test('works on mobile viewport (320px)', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });

      // Check that hamburger menu button is visible
      const menuButton = page.locator('button[aria-label="Toggle menu"]');
      await expect(menuButton).toBeVisible();

      // Content should still be accessible
      await expect(page.locator('text=Welcome back')).toBeVisible();
    });

    test('works on tablet viewport (768px)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      // Verify dashboard renders correctly
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('text=Quick Actions')).toBeVisible();
    });

    test('works on desktop viewport (1024px+)', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });

      // Desktop navigation should be visible
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('text=Learn')).toBeVisible();

      // All quick action cards should be in a row (grid layout)
      const quickActionsGrid = page.locator('.grid').first();
      await expect(quickActionsGrid).toBeVisible();
    });

    test('hamburger menu works on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const menuButton = page.locator('button[aria-label="Toggle menu"]');

      // Open menu
      await menuButton.click();

      // Mobile menu should be visible with "Signed in as" text
      await expect(page.locator('text=Signed in as')).toBeVisible();

      // Close menu
      await menuButton.click();

      // Mobile menu should be hidden
      await expect(page.locator('text=Signed in as')).not.toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard/);
    });

    test('keyboard navigation works', async ({ page }) => {
      // Tab through navigation links
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Focus should be visible (browser will handle focus styles)
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });

    test('has proper semantic HTML structure', async ({ page }) => {
      // Check for semantic elements
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('h2').first()).toBeVisible();
    });

    test('touch targets meet minimum size on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Check hamburger button size (should be at least 44x44px)
      const menuButton = page.locator('button[aria-label="Toggle menu"]');
      const box = await menuButton.boundingBox();

      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    });
  });

  test.describe('Session Persistence', () => {
    test('session persists across page refresh', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard/);

      // Verify logged in
      await expect(page.locator('text=Welcome back')).toBeVisible();

      // Refresh page
      await page.reload();

      // Should still be on dashboard (not redirected to login)
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('text=Welcome back')).toBeVisible();
    });
  });
});

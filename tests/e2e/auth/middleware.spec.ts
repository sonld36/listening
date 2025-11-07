import { test, expect } from '@playwright/test';

test.describe('Middleware Route Protection', () => {
  const protectedRoutes = ['/dashboard', '/learn', '/flashcards'];
  const publicRoutes = ['/', '/login', '/signup'];

  test.describe('Unauthenticated Access', () => {
    test.beforeEach(async ({ context }) => {
      // Clear all cookies to ensure unauthenticated state
      await context.clearCookies();
    });

    test('should redirect to login when accessing /dashboard without authentication', async ({ page }) => {
      await page.goto('/dashboard');

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect to login when accessing /learn without authentication', async ({ page }) => {
      await page.goto('/learn');

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect to login when accessing /flashcards without authentication', async ({ page }) => {
      await page.goto('/flashcards');

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/);
    });

    test('should allow access to public routes without authentication', async ({ page }) => {
      for (const route of publicRoutes) {
        await page.goto(route);

        // Should NOT redirect to login
        await expect(page).not.toHaveURL(/\/login/);

        // Should be on the intended route (or redirected elsewhere but not to login)
        if (route === '/') {
          // Landing page
          await expect(page).toHaveURL('/');
        } else {
          // Login or signup pages
          await expect(page).toHaveURL(route);
        }
      }
    });
  });

  test.describe('Authenticated Access', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/password/i).fill('TestPassword123');
      await page.getByRole('button', { name: /sign in/i }).click();

      // Wait for redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should allow access to /dashboard when authenticated', async ({ page }) => {
      await page.goto('/dashboard');

      // Should stay on dashboard
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.locator('h1')).toContainText(/welcome back/i);
    });

    test('should allow access to /learn when authenticated', async ({ page }) => {
      // Note: /learn may not be fully implemented yet
      await page.goto('/learn');

      // Should NOT redirect to login
      await expect(page).not.toHaveURL(/\/login/);
    });

    test('should allow access to /flashcards when authenticated', async ({ page }) => {
      // Note: /flashcards may not be fully implemented yet
      await page.goto('/flashcards');

      // Should NOT redirect to login
      await expect(page).not.toHaveURL(/\/login/);
    });

    test('should still allow access to public routes when authenticated', async ({ page }) => {
      // Can still visit login page (though it may redirect to dashboard)
      await page.goto('/login');

      // Either stays on login or redirects to dashboard (both are acceptable)
      const url = page.url();
      const isOnLoginOrDashboard = url.includes('/login') || url.includes('/dashboard');
      expect(isOnLoginOrDashboard).toBeTruthy();
    });
  });

  test.describe('Session Expiry', () => {
    test('should redirect to login after logout from protected route', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/password/i).fill('TestPassword123');
      await page.getByRole('button', { name: /sign in/i }).click();
      await expect(page).toHaveURL(/\/dashboard/);

      // Logout
      await page.getByRole('button', { name: /logout/i }).click();

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);

      // Try to access protected route again
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Callback URL Preservation', () => {
    test('should preserve intended destination after login', async ({ page }) => {
      // Try to access a protected route while unauthenticated
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);

      // Login
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/password/i).fill('TestPassword123');
      await page.getByRole('button', { name: /sign in/i }).click();

      // Should redirect back to dashboard (intended destination)
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });
});

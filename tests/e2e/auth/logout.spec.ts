import { test, expect } from '@playwright/test';

test.describe('Logout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('TestPassword123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display logout button in navigation', async ({ page }) => {
    const logoutButton = page.getByRole('button', { name: /logout/i });
    await expect(logoutButton).toBeVisible();
  });

  test('should logout and redirect to login page', async ({ page }) => {
    // Click logout button
    await page.getByRole('button', { name: /logout/i }).click();

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should clear session completely after logout', async ({ page }) => {
    // Logout
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/login/);

    // Try to access protected route
    await page.goto('/dashboard');

    // Should redirect back to login (not allowed)
    await expect(page).toHaveURL(/\/login/);
  });

  test('should clear cookies after logout', async ({ page, context }) => {
    // Get cookies before logout
    const cookiesBeforeLogout = await context.cookies();
    const hasAuthCookiesBefore = cookiesBeforeLogout.some(
      cookie => cookie.name.includes('next-auth') || cookie.name.includes('session')
    );

    // Should have auth cookies while logged in
    expect(hasAuthCookiesBefore).toBeTruthy();

    // Logout
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/login/);

    // Give time for cookies to clear
    await page.waitForTimeout(500);

    // Get cookies after logout
    const cookiesAfterLogout = await context.cookies();
    const hasAuthCookiesAfter = cookiesAfterLogout.some(
      cookie =>
        cookie.name.includes('next-auth.session-token') &&
        cookie.value !== ''
    );

    // Auth cookies should be cleared or invalidated
    expect(hasAuthCookiesAfter).toBeFalsy();
  });

  test('should show loading state while logging out', async ({ page }) => {
    const logoutButton = page.getByRole('button', { name: /logout/i });

    // Click logout
    await logoutButton.click();

    // Should show loading text briefly
    await expect(page.getByRole('button', { name: /logging out/i })).toBeVisible();
  });

  test('should not allow back navigation to protected routes after logout', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // Logout
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/login/);

    // Try to go back
    await page.goBack();

    // Should redirect to login (not show cached dashboard)
    await expect(page).toHaveURL(/\/login/);
  });

  test('should require new login after logout', async ({ page }) => {
    // Logout
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/login/);

    // Should see login form
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();

    // Login again with same credentials
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('TestPassword123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should successfully login again
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should logout from mobile menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Open mobile menu
    const menuButton = page.getByLabel(/toggle menu/i);
    await menuButton.click();

    // Should see logout button in mobile menu
    const logoutButton = page.getByRole('button', { name: /logout/i });
    await expect(logoutButton).toBeVisible();

    // Click logout
    await logoutButton.click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should clear Zustand store after logout', async ({ page }) => {
    // Verify user is logged in by checking dashboard content
    await expect(page.locator('h1')).toContainText(/welcome back/i);

    // Logout
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/login/);

    // Login again
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('TestPassword123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Should show fresh user data (not stale from previous session)
    await expect(page.locator('h1')).toContainText(/welcome back/i);
  });
});

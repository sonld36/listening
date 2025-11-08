import { test, expect } from '@playwright/test';

test.describe('Video Learning Interface E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
  });

  test.describe('Navigation to Learning Interface', () => {
    test('should navigate to learning interface from dashboard', async ({ page }) => {
      // Note: This assumes there will be clip cards on dashboard in future
      // For now, test direct navigation
      await page.goto('/learn/test-clip-id');

      // Should see video player interface
      await expect(page.locator('text=Loading video')).toBeVisible({ timeout: 5000 });
    });

    test('should show app navigation bar', async ({ page }) => {
      await page.goto('/learn/test-clip-id');

      await expect(page.locator('text=Friends Dictation')).toBeVisible();
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });
  });

  test.describe('Authentication Protection', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Clear cookies to simulate unauthenticated state
      await page.context().clearCookies();

      await page.goto('/learn/test-clip-id');

      // Should redirect to login
      await page.waitForURL('/login');
      expect(page.url()).toContain('/login');
    });
  });

  test.describe('Video Player Interface', () => {
    test('should display clip information', async ({ page }) => {
      // Mock API response for clip data
      await page.route('**/api/clips/*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'test-clip-id',
              title: 'Friends Scene 1',
              description: 'A funny scene from Friends',
              clipUrl: 'https://cdn.example.com/clip.mp4',
              durationSeconds: 10,
              difficultyLevel: 'BEGINNER',
              subtitleText: 'How you doin?',
              difficultyWords: null,
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z',
            },
          }),
        });
      });

      await page.goto('/learn/test-clip-id');

      // Wait for clip data to load
      await expect(page.locator('text=Friends Scene 1')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=A funny scene from Friends')).toBeVisible();
      await expect(page.locator('text=BEGINNER')).toBeVisible();
      await expect(page.locator('text=10s')).toBeVisible();
    });

    test('should show error message for invalid clip ID', async ({ page }) => {
      // Mock API error response
      await page.route('**/api/clips/invalid-id', async (route) => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: {
              code: 'CLIP_NOT_FOUND',
              message: 'The requested clip could not be found.',
            },
          }),
        });
      });

      await page.goto('/learn/invalid-id');

      // Should show error state
      await expect(page.locator('text=Failed to Load Video')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Return to Dashboard')).toBeVisible();
    });

    test('should display keyboard shortcuts help', async ({ page }) => {
      await page.route('**/api/clips/*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'test-clip-id',
              title: 'Test Clip',
              clipUrl: 'https://cdn.example.com/clip.mp4',
              durationSeconds: 10,
              difficultyLevel: 'BEGINNER',
              subtitleText: 'Test',
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z',
            },
          }),
        });
      });

      await page.goto('/learn/test-clip-id');

      // Wait for page to load
      await page.waitForTimeout(2000);

      // Should show keyboard shortcuts
      await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
      await expect(page.locator('text=Play/Pause')).toBeVisible();
      await expect(page.locator('text=Replay from beginning')).toBeVisible();
    });
  });

  test.describe('Navigation Actions', () => {
    test('should navigate back to dashboard when back button is clicked', async ({ page }) => {
      await page.route('**/api/clips/*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'test-clip-id',
              title: 'Test Clip',
              clipUrl: 'https://cdn.example.com/clip.mp4',
              durationSeconds: 10,
              difficultyLevel: 'BEGINNER',
              subtitleText: 'Test',
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z',
            },
          }),
        });
      });

      await page.goto('/learn/test-clip-id');

      // Wait for page to load
      await page.waitForTimeout(1000);

      // Click back button
      await page.click('text=Back to Dashboard');

      // Should navigate to dashboard
      await page.waitForURL('/dashboard');
      expect(page.url()).toContain('/dashboard');
    });

    test('should return to dashboard from error state', async ({ page }) => {
      await page.route('**/api/clips/invalid-id', async (route) => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: {
              code: 'CLIP_NOT_FOUND',
              message: 'Clip not found',
            },
          }),
        });
      });

      await page.goto('/learn/invalid-id');

      // Wait for error state
      await expect(page.locator('text=Failed to Load Video')).toBeVisible();

      // Click return to dashboard button in error state
      const returnButton = page.locator('text=Return to Dashboard').first();
      await returnButton.click();

      // Should navigate to dashboard
      await page.waitForURL('/dashboard', { timeout: 5000 });
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.route('**/api/clips/*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'test-clip-id',
              title: 'Mobile Test Clip',
              clipUrl: 'https://cdn.example.com/clip.mp4',
              durationSeconds: 10,
              difficultyLevel: 'BEGINNER',
              subtitleText: 'Test',
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z',
            },
          }),
        });
      });

      await page.goto('/learn/test-clip-id');

      // Wait for content to load
      await page.waitForTimeout(1000);

      // Should still display all key elements
      await expect(page.locator('text=Mobile Test Clip')).toBeVisible();
      await expect(page.locator('text=Back to Dashboard')).toBeVisible();
    });

    test('should be responsive on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.route('**/api/clips/*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'test-clip-id',
              title: 'Tablet Test Clip',
              clipUrl: 'https://cdn.example.com/clip.mp4',
              durationSeconds: 10,
              difficultyLevel: 'INTERMEDIATE',
              subtitleText: 'Test',
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z',
            },
          }),
        });
      });

      await page.goto('/learn/test-clip-id');

      await page.waitForTimeout(1000);

      await expect(page.locator('text=Tablet Test Clip')).toBeVisible();
      await expect(page.locator('text=INTERMEDIATE')).toBeVisible();
    });

    test('should be responsive on desktop viewport', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });

      await page.route('**/api/clips/*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'test-clip-id',
              title: 'Desktop Test Clip',
              clipUrl: 'https://cdn.example.com/clip.mp4',
              durationSeconds: 10,
              difficultyLevel: 'ADVANCED',
              subtitleText: 'Test',
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z',
            },
          }),
        });
      });

      await page.goto('/learn/test-clip-id');

      await page.waitForTimeout(1000);

      await expect(page.locator('text=Desktop Test Clip')).toBeVisible();
      await expect(page.locator('text=ADVANCED')).toBeVisible();
    });
  });

  test.describe('Loading States', () => {
    test('should show loading spinner while fetching clip data', async ({ page }) => {
      // Delay the API response to test loading state
      await page.route('**/api/clips/*', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'test-clip-id',
              title: 'Delayed Clip',
              clipUrl: 'https://cdn.example.com/clip.mp4',
              durationSeconds: 10,
              difficultyLevel: 'BEGINNER',
              subtitleText: 'Test',
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z',
            },
          }),
        });
      });

      await page.goto('/learn/test-clip-id');

      // Should show loading spinner
      await expect(page.locator('text=Loading video')).toBeVisible();

      // Wait for data to load
      await expect(page.locator('text=Delayed Clip')).toBeVisible({ timeout: 5000 });
    });
  });
});

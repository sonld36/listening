import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('should display registration form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
  });

  test('should show validation errors for invalid inputs', async ({ page }) => {
    // Click submit without filling fields
    await page.getByRole('button', { name: /sign up/i }).click();

    // Check for validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('ValidPass123');
    await page.getByRole('button', { name: /sign up/i }).click();

    await expect(page.getByText(/invalid email format/i)).toBeVisible();
  });

  test('should show error for weak password (too short)', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Short1');
    await page.getByRole('button', { name: /sign up/i }).click();

    await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
  });

  test('should show error for password without uppercase', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('nouppercase123');
    await page.getByRole('button', { name: /sign up/i }).click();

    await expect(page.getByText(/uppercase letter/i)).toBeVisible();
  });

  test('should show error for password without number', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('NoNumbers');
    await page.getByRole('button', { name: /sign up/i }).click();

    await expect(page.getByText(/contain.*number/i)).toBeVisible();
  });

  test('should have link to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /sign in/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/login');
  });

  test('should redirect to login page after successful registration', async ({ page }) => {
    // Note: This test assumes database is available and email is unique
    const uniqueEmail = `test${Date.now()}@example.com`;

    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel(/password/i).fill('ValidPass123');
    await page.getByRole('button', { name: /sign up/i }).click();

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login\?registered=true/);

    // Should show success message
    await expect(page.getByText(/account created successfully/i)).toBeVisible();
  });

  test('should show error for duplicate email', async ({ page }) => {
    // Note: This test assumes a user already exists with this email
    // You may need to adjust based on your test database setup
    const existingEmail = 'existing@example.com';

    await page.getByLabel(/email/i).fill(existingEmail);
    await page.getByLabel(/password/i).fill('ValidPass123');
    await page.getByRole('button', { name: /sign up/i }).click();

    // Should show duplicate email error
    await expect(page.getByText(/already exists/i)).toBeVisible();
  });

  test('should disable submit button while submitting', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /sign up/i });

    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('ValidPass123');

    // Click submit
    await submitButton.click();

    // Button should be disabled during submission
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toHaveText(/creating account/i);
  });
});

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should have link to signup page', async ({ page }) => {
    const signupLink = page.getByRole('link', { name: /sign up/i });
    await expect(signupLink).toBeVisible();
    await expect(signupLink).toHaveAttribute('href', '/signup');
  });

  test('should display success message when redirected from signup', async ({ page }) => {
    await page.goto('/login?registered=true');
    await expect(page.getByText(/account created successfully/i)).toBeVisible();
  });
});

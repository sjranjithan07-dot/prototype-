import { test, expect } from '@playwright/test';

test.describe('App E2E Tests', () => {
  test('Landing page loads and navigates to login', async ({ page }) => {
    // 1. Go to the landing page
    await page.goto('/');

    // 2. Verify title
    await expect(page).toHaveTitle(/AI HR Interview Coach/);

    // 3. Find and click "Get Started"
    const getStartedButton = page.getByRole('link', { name: 'Get Started' });
    await expect(getStartedButton).toBeVisible();
    await getStartedButton.click();

    // 4. Verify we are on the Login page
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    
    // 5. Verify Sign in button exists
    await expect(page.getByRole('button', { name: 'Sign in with Email' })).toBeVisible();
  });
});

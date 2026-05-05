// @ts-check
const { test, expect } = require('@playwright/test');

// Test 1: Landing page loads and shows CTA button
test('landing page loads and shows CTA button', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#view-landing')).toBeVisible();
  await expect(page.locator('.btn-start')).toBeVisible();
  await expect(page.locator('.btn-start')).toContainText('Build My Website');
});

// Test 2: Clicking CTA navigates to onboarding step 1
test('CTA button navigates to onboarding step 1', async ({ page }) => {
  await page.goto('/');
  await page.locator('.btn-start').click();
  await expect(page.locator('#view-onboarding')).toHaveClass(/active/);
  await expect(page.locator('#step-1')).toBeVisible();
});

// Test 3: Step 1 — palette content renders
test('step 1: palette colour swatches render', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.navigateToStep(1));
  await expect(page.locator('#step-1')).toBeVisible();
  // .palette-grid contains the colour swatch options
  await expect(page.locator('.palette-grid')).toBeVisible();
  // At least one palette option should be present
  const paletteOptions = page.locator('.palette-option');
  await expect(paletteOptions.first()).toBeVisible();
  // Background mode selector should also render
  await expect(page.locator('.background-mode-block')).toBeVisible();
  await expect(page.locator('#mode-dark')).toBeVisible();
  await expect(page.locator('#mode-light')).toBeVisible();
});

// Test 4: Step 2 — font content renders
test('step 2: font options render', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.navigateToStep(2));
  await expect(page.locator('#step-2')).toBeVisible();
  // .font-list-scroll contains the font option cards
  await expect(page.locator('.font-list-scroll')).toBeVisible();
  // At least one font-option-card should be present
  const fontCards = page.locator('.font-option-card');
  await expect(fontCards.first()).toBeVisible();
  // Live preview panel should render
  await expect(page.locator('.font-preview-area')).toBeVisible();
  await expect(page.locator('#preview-text')).toBeVisible();
});

// Test 5: Step 3 — layout toggle content renders
test('step 3: layout section toggles render', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.navigateToStep(3));
  await expect(page.locator('#step-3')).toBeVisible();
  // #section-list is populated by JS with layout section toggles
  await expect(page.locator('#section-list')).toBeVisible();
  // The wireframe preview canvas should also be present
  await expect(page.locator('#preview-canvas')).toBeVisible();
  // Active sections count badge should render
  await expect(page.locator('#active-sections-count')).toBeVisible();
});

// Test 6: Step 4 — feature card content renders
test('step 4: feature cards render', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.navigateToStep(4));
  await expect(page.locator('#step-4')).toBeVisible();
  // #features-composition wraps all feature toggle cards
  await expect(page.locator('#features-composition')).toBeVisible();
  // At least one feature-toggle-card (Contact, Payment, Booking, Blog, Newsletter)
  const featureCards = page.locator('.feature-toggle-card');
  await expect(featureCards.first()).toBeVisible();
  // Social media card and language card should also be visible
  await expect(page.locator('.social-card')).toBeVisible();
  await expect(page.locator('.language-card')).toBeVisible();
});

// Test 7: Step 5 — form input content renders
test('step 5: final details form inputs render', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.navigateToStep(5));
  await expect(page.locator('#step-5')).toBeVisible();
  // Required form inputs
  await expect(page.locator('#input-business-name')).toBeVisible();
  await expect(page.locator('#input-email')).toBeVisible();
  await expect(page.locator('#input-customers')).toBeVisible();
  await expect(page.locator('#input-location')).toBeVisible();
  // Optional inputs
  await expect(page.locator('#input-reference')).toBeVisible();
  await expect(page.locator('#input-final-notes')).toBeVisible();
  // Timeline selector
  await expect(page.locator('.timeline-bar')).toBeVisible();
});

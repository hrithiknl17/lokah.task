import { type Page, expect, test } from '@playwright/test';

// The user supplies real clips and images; the test serves stand-ins so the
// flow does not depend on those files being present.
async function serveMedia(page: Page) {
  await page.route('**/audio/**', (route) =>
    route.fulfill({ status: 200, contentType: 'audio/mpeg', body: '' }),
  );
  await page.route('**/images/**', (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', path: 'tests/e2e/fixtures/pixel.png' }),
  );
}

async function expectNoHorizontalScroll(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, 'page should not scroll horizontally').toBeLessThanOrEqual(clientWidth);
}

test('browse → start → submit → pending → demo approve → earnings → reload persists', async ({
  page,
}) => {
  await serveMedia(page);
  await page.goto('/');
  await expectNoHorizontalScroll(page);

  // Browse
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Tasks' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Tasks' })).toBeVisible();
  await expectNoHorizontalScroll(page);

  // Reward and ₹/hour are visible before starting.
  const card = page.getByRole('link', { name: /Verify a Kannada bus time/ });
  await expect(card).toContainText('₹5.00');
  await expect(card).toContainText('per hour');
  await expect(card).toContainText('Demo data');
  await card.click();

  // Start
  await expect(page.getByRole('heading', { level: 1, name: 'Verify a Kannada bus time' })).toBeVisible();
  await page.getByRole('button', { name: 'Start task' }).click();
  await expect(page.getByText('In progress').first()).toBeVisible();
  await expectNoHorizontalScroll(page);

  // This transcript is deliberately wrong, so "Doesn't match" is correct.
  const submit = page.getByRole('button', { name: 'Submit for review' });
  await expect(submit).toBeEnabled();
  await page.getByRole('radio', { name: "Doesn't match" }).check();
  await submit.click();

  // Pending review
  await expect(page.getByRole('status').filter({ hasText: 'Submitted' })).toBeVisible();
  await expect(page.getByText('Pending review').first()).toBeVisible();
  await expect(page.getByText('Demo reviewer — simulated, not a real quality assessment.')).toBeVisible();
  await expect(page.getByTestId('reviewer-suggestion')).toHaveAttribute('data-outcome', 'approve');
  await expectNoHorizontalScroll(page);

  // Pending is not counted as approved.
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Earnings' }).click();
  await expect(page.getByTestId('approved-total')).toContainText('₹0.00');
  await expect(page.getByTestId('pending-total')).toContainText('₹5.00');
  await page.goBack();

  // Demo approve
  await page.getByRole('button', { name: 'Approve' }).click();
  await expect(page.getByText('Approved. Reward added to earnings.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approve' })).toHaveCount(0);

  // Earnings update
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Earnings' }).click();
  await expect(page.getByTestId('approved-total')).toContainText('₹5.00');
  await expect(page.getByTestId('pending-total')).toContainText('₹0.00');
  await expect(page.getByRole('link', { name: 'Verify a Kannada bus time' })).toBeVisible();
  await expectNoHorizontalScroll(page);

  // Reload persists
  await page.reload();
  await expect(page.getByTestId('approved-total')).toContainText('₹5.00');
  await expect(page.getByRole('link', { name: 'Verify a Kannada bus time' })).toHaveCount(1);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('lokah:v1') ?? '{}'));
  expect(stored.schemaVersion).toBe(1);
  expect(stored.submissions['lv-kn-02'].status).toBe('approved');

  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'History' }).click();
  await expect(page.getByText('Approved').first()).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test('missing audio shows a message and disables submit', async ({ page }) => {
  await page.route('**/audio/**', (route) => route.fulfill({ status: 404, body: '' }));
  await page.goto('/#/tasks/lv-kn-01');
  await page.getByRole('button', { name: 'Start task' }).click();
  await expect(page.getByText('Audio unavailable — try again later')).toBeVisible();
  await expect(page.locator('audio')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Submit for review' })).toBeDisabled();
});

test('corrupt saved data falls back to a fresh state with a notice', async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('lokah:v1', '{broken');
      sessionStorage.setItem('seeded', '1');
    }
  });
  await page.goto('/');
  await expect(page.getByText('Saved data could not be read')).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.getByText('Saved data could not be read')).toHaveCount(0);
});

test('no horizontal scroll at 320px on every screen', async ({ page }) => {
  await serveMedia(page);
  await page.setViewportSize({ width: 320, height: 640 });
  for (const path of ['/', '/#/tasks', '/#/tasks/di-01', '/#/earnings', '/#/history', '/#/profile']) {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    await expectNoHorizontalScroll(page);
  }
});

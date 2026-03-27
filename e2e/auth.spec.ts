import { test, expect } from "@playwright/test";

const TEST_EMAIL = `e2e-${Date.now()}@test.com`;
const TEST_PASS = "Test1234!";
const TEST_NAME = "Casal E2E";

test.describe("Auth flow", () => {
  test("register and login as couple", async ({ page }) => {
    // Register
    await page.goto("/login");
    await page.fill('input[type="text"]', TEST_NAME);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASS);
    await page.click('button:has-text("Criar conta")');

    // Should redirect to dashboard
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test("login with valid credentials", async ({ page }) => {
    await page.goto("/login");

    // Switch to login tab
    const loginTab = page.locator('button:has-text("Entrar")').first();
    if (await loginTab.isVisible()) await loginTab.click();

    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASS);
    await page.click('button:has-text("Entrar")');

    await page.waitForURL("**/dashboard", { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });
});

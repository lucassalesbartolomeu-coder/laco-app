import { test, expect } from "@playwright/test";

test.describe("Wedding flow", () => {
  test("create wedding wizard", async ({ page }) => {
    // Register fresh user
    const email = `e2e-wedding-${Date.now()}@test.com`;
    await page.goto("/login");
    await page.fill('input[type="text"]', "Casal Teste");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', "Test1234!");
    await page.click('button:has-text("Criar conta")');
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    // Go to create wedding
    await page.goto("/casamento/novo");
    await expect(page.locator("text=Passo 1")).toBeVisible();

    // Step 1 — names
    const inputs = page.locator("input");
    await inputs.nth(0).fill("Ana");
    await inputs.nth(1).fill("Bruno");
    await page.click('button:has-text("Proximo")');

    // Step 2 — date/venue
    await expect(page.locator("text=Passo 2")).toBeVisible();
    await page.click('button:has-text("Proximo")');

    // Step 3 — slug
    await expect(page.locator("text=Passo 3")).toBeVisible();
    await page.click('button:has-text("Criar casamento")');

    // Should redirect to convidados or dashboard
    await page.waitForURL(/casamento|dashboard/, { timeout: 10000 });
  });
});

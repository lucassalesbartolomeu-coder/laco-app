import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/home");
  await expect(page).toHaveTitle(/Laço/i);
  await expect(page.locator("text=Comece a planejar")).toBeVisible();
});

test("login page loads with toggle", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("text=Sou Casal")).toBeVisible();
  await expect(page.locator("text=Sou Cerimonialista")).toBeVisible();
});

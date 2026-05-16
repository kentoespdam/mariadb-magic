import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");
  // Check for some common element or title
  await expect(page).toHaveTitle(/Magic MariaDB/i);
});

test("navigation works", async ({ page }) => {
  await page.goto("/");
  // Basic navigation test if possible
});

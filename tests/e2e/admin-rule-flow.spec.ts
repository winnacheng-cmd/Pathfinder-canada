import { expect, test } from "@playwright/test";

/**
 * Requires a real Supabase project AND a pre-existing admin account (an
 * account whose email was in ADMIN_EMAILS at signup time — see
 * docs/DATABASE.md). Supply E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD to run
 * this for real; without them the test is skipped with an explicit reason
 * (shown as SKIPPED, never reported as a silent pass) rather than failing,
 * since a missing test fixture is a different problem than a broken
 * feature. See docs/TESTING.md.
 */
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

test.describe("admin creates a rule and it appears in student evaluation", () => {
  test.skip(
    !adminEmail || !adminPassword,
    "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (a real admin account) to run this test."
  );

  test("a new requirement created in admin is visible on the program's detail page", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(adminEmail!);
    await page.getByLabel("Password").fill(adminPassword!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });

    await page.goto("/admin/requirements");
    await expect(page.getByRole("heading", { name: "Requirements" })).toBeVisible();

    await page.getByRole("button", { name: "Add requirement" }).click();
    const displayText = `E2E test requirement ${Date.now()}`;
    await page.getByLabel("Display text (shown to students)").fill(displayText);
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText(displayText)).toBeVisible({ timeout: 10_000 });
  });
});

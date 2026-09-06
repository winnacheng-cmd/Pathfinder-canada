import { expect, test } from "@playwright/test";

/**
 * Requires a real Supabase project configured in .env.local — see
 * README.md "Supabase setup" and docs/TESTING.md. This intentionally does
 * NOT skip-and-pass when Supabase is absent: it fails with a clear
 * Playwright error (element not found) so a missing backend is loud, not
 * silently green.
 */
test.describe("signup → onboarding → dashboard", () => {
  test("a new student can sign up, complete onboarding, and land on the dashboard", async ({ page }) => {
    const email = `pathfinder-e2e-${Date.now()}@example.com`;

    await page.goto("/signup");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("correct horse battery staple 1");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/onboarding$/, { timeout: 15_000 });

    // Step 1: location (BC is preselected/locked) — Continue.
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 2: grade level.
    await page.getByLabel("Grade 12").check();
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 3: graduation year.
    await page.getByRole("spinbutton").fill("2027");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 4: courses — add one so the profile isn't empty.
    await page.getByPlaceholder(/search courses/i).fill("Chemistry 12");
    await page.getByRole("button", { name: /\+ Chemistry 12/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 5: interests — skip.
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 6: target programs — save one, then finish.
    await page.getByPlaceholder(/search programs/i).fill("Biomedical");
    await page.getByRole("button", { name: "Save" }).first().click();
    await page.getByRole("button", { name: "Finish" }).click();

    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
  });
});

import { expect, test } from "@playwright/test";

/**
 * The one journey that runs with zero backend configuration — see
 * docs/TESTING.md. Covers build-prompt §50's "critical journey":
 * landing → demo → eligibility → what-if → source link.
 */
test.describe("student demo journey (no backend required)", () => {
  test("landing page communicates the product and links to the demo", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /know exactly what your grades open/i })).toBeVisible();
    await expect(page.getByText(/no made-up admission probabilities/i)).toBeVisible();
    await page.getByRole("link", { name: "Try Demo Student" }).click();
    await expect(page).toHaveURL(/\/demo$/);
  });

  test("demo shows eligibility results, priority actions, and a working what-if simulator", async ({ page }) => {
    await page.goto("/demo");

    await expect(page.getByText(/you're viewing a demo profile/i)).toBeVisible();
    await expect(page.getByText("Saved programs")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Priority actions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What-If Simulator" })).toBeVisible();

    // Before running the scenario, at least one program shows a non-eligible status.
    await expect(page.getByText("Missing requirements").first()).toBeVisible();

    // Applying the Pre-Calculus preset should change the before/after comparison.
    const beforeAfter = page.getByText(/eligible$/);
    await expect(beforeAfter.first()).toBeVisible();

    const preset = page.getByRole("button", { name: /what if pre-calculus 12 = 90/i });
    await preset.click();

    await expect(page.getByText("Newly opened")).toBeVisible();
  });

  test("a requirement's official source link is a real, clickable external link", async ({ page }) => {
    await page.goto("/demo");
    const sourceLink = page.getByRole("link", { name: "Official source" }).first();
    // Accordion content may need expanding first if collapsed by default.
    if (!(await sourceLink.isVisible().catch(() => false))) {
      await page.getByRole("button", { name: /Biomedical Sciences/i }).first().click();
    }
    await expect(page.getByRole("link", { name: "Official source" }).first()).toHaveAttribute(
      "target",
      "_blank"
    );
  });

  test("methodology, privacy, and terms pages are reachable and explain the trust model", async ({ page }) => {
    await page.goto("/methodology");
    await expect(page.getByText(/does not use AI to invent admission requirements/i)).toBeVisible();

    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: "Privacy" })).toBeVisible();

    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: "Terms" })).toBeVisible();
  });
});

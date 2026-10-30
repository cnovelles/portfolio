import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  { name: "home", path: "/" },
  { name: "404", path: "/this-page-does-not-exist" },
];

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

for (const { name, path } of pages) {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`${name} page has no axe violations in ${colorScheme} theme`, async ({ page }) => {
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", colorScheme);

      const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test("skip link is the first stop and moves focus to main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("every link and button can be reached with the keyboard", async ({ page }) => {
  await page.goto("/");
  // Only controls actually rendered at this viewport (section links collapse on phones).
  const total = await page.evaluate(
    () =>
      [...document.querySelectorAll<HTMLElement>("a[href], button")].filter(
        (el) => el.getClientRects().length > 0,
      ).length,
  );

  const reached = new Set<string>();
  for (let i = 0; i < total + 2; i++) {
    await page.keyboard.press("Tab");
    const id = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      return `${el.tagName}|${el.getAttribute("href") ?? ""}|${el.textContent?.trim() ?? ""}`;
    });
    if (id) reached.add(id);
  }

  expect(reached.size).toBe(total);
});

test("theme toggle works from the keyboard and persists", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Switch to dark theme" });
  await toggle.focus();
  await page.keyboard.press("Enter");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("back to top returns to the top of the page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Back to top" }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

import { test, expect } from "@playwright/test";

test("music prompt starts neutrally and keyboard focus stays visible but quiet", async ({
  page,
}) => {
  await page.goto("/");
  const dialog = page.locator("dialog.envelope-music");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("p")).toBeFocused();
  await expect(
    dialog.getByRole("button", { name: "С музыкой", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(
    dialog.getByRole("button", { name: "Без музыки", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("Tab");
  const enable = dialog.getByRole("button", { name: "С музыкой", exact: true });
  await expect(enable).toBeFocused();
  await expect(enable).toHaveCSS("outline-style", "solid");
  await expect(enable).toHaveCSS("outline-width", "1px");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(dialog).not.toBeVisible();
  await page
    .getByRole("button", { name: "Открыть приглашение", exact: true })
    .click();
  await expect(page.locator(".hero-title")).toBeVisible();
  await page.goto("/#/invitation?section=gifts");
  await expect(page.locator("#gifts")).toBeFocused();
  const input = page.locator('.rsvp input[name="name"]');
  await input.focus();
  await expect(input).toBeFocused();
  await expect(input).toHaveCSS("outline-style", "solid");
  await expect(input).toHaveCSS("outline-width", "1px");
  await input.fill("Тестовый гость");
  await expect(input).toHaveValue("Тестовый гость");
});

for (const width of [320, 390, 768, 1440]) {
  test(`sort popup stays inside viewport and aligns right at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/wishlist?view=gifts");
    const sort = page.locator(".gift-sort");
    const summary = sort.locator("summary");
    for (const label of [
      "По возрастанию цены",
      "По убыванию цены",
      "По названию",
    ]) {
      await summary.click();
      const menu = sort.locator(":scope > div");
      await expect(menu).toBeVisible();
      const popup = (await menu.boundingBox())!;
      const anchor = (await summary.boundingBox())!;
      expect(popup.x).toBeGreaterThanOrEqual(0);
      expect(popup.x + popup.width).toBeLessThanOrEqual(width);
      expect(
        Math.abs(popup.x + popup.width - anchor.x - anchor.width),
      ).toBeLessThanOrEqual(1);
      await menu.getByRole("button", { name: label, exact: true }).click();
      await expect(menu).not.toBeVisible();
      await expect(summary).toContainText(label);
      await expect(summary).toBeFocused();
    }
  });
}

import { test, expect } from "@playwright/test";
for (const width of [390, 1440])
  test(`responsive review ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#/memories");
    await expect(page.locator(".wish-card")).toHaveCount(width < 768 ? 8 : 24);
    if (width < 768) {
      await page.getByRole("button", { name: "Загрузить ещё" }).click();
      await expect(page.locator(".wish-card")).toHaveCount(16);
      await page.getByRole("button", { name: "Загрузить ещё" }).click();
      await expect(page.locator(".wish-card")).toHaveCount(24);
      await expect(
        page.getByRole("button", { name: "Загрузить ещё" }),
      ).toHaveCount(0);
    } else {
      const feed = page.locator(".wish-cards");
      expect(await feed.evaluate((e) => e.scrollHeight > e.clientHeight)).toBe(
        true,
      );
      await feed.hover();
      const before = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, 250);
      await expect
        .poll(() => feed.evaluate((e) => e.scrollTop))
        .toBeGreaterThan(0);
      expect(await page.evaluate(() => scrollY)).toBe(before);
    }
    await page.screenshot({ path: `test-results/review-memory-${width}.png` });
    await page.goto("/#/wishlist?view=gifts");
    {
      await expect(page.locator(".gift-settings")).not.toBeVisible();
      await page.getByRole("button", { name: "Фильтры", exact: true }).click();
    }
    await expect(page.locator(".gift-settings")).toBeVisible();
    await page.goto("/#/personal");
    await expect(page.locator("main")).toBeFocused();
    const deck = page.locator(".photo-deck").first();
    await deck.getByRole("button", { name: "Фотография 3 из 3" }).click();
    await expect(deck.locator("[aria-live]")).toHaveText("3 из 3");
    const rect = await deck.locator(".photo-space").first().boundingBox();
    expect(Math.abs(rect!.width - rect!.height)).toBeLessThan(1);
    await page.goto("/#/invitation?section=gifts");
    await page.locator(".venue").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/review-venue-${width}.png` });
    await expect(page.locator(".butterfly-layer")).toHaveCount(5);
    expect(
      await page
        .locator(".butterfly-layer")
        .first()
        .evaluate((e) => e.parentElement === document.body),
    ).toBe(true);
  });
test("whole link and preference surfaces animate with their contents", async ({
  page,
}) => {
  await page.goto("/#/invitation?section=personal");
  const copy = page.locator(".wishlist-copy");
  await page.evaluate(() => scrollTo(0, 0));
  await expect(copy).toHaveCSS("opacity", "0");
  await copy.scrollIntoViewIfNeeded();
  await expect(copy).toHaveCSS("opacity", "1");
  const link = page.locator(".paper-link").first();
  await link.scrollIntoViewIfNeeded();
  await expect(link).toHaveCSS("opacity", "1");
  await link.hover();
  expect(
    await link
      .locator("path")
      .first()
      .evaluate((e) => e.getAnimations().length),
  ).toBeGreaterThan(0);
  await page.goto("/#/personal");
  await expect(page.locator("main")).toBeFocused();
  const notes = page.locator(".preference-notes");
  await notes.scrollIntoViewIfNeeded();
  await expect(notes.locator("p").last()).toHaveCSS("opacity", "1");
  await expect(notes.locator("p").first()).toHaveAttribute(
    "style",
    /opacity: 1/,
  );
});

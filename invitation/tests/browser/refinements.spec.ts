import { test, expect } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`photo decks cycle independently and keep vertical stories at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#/personal");
    const decks = page.locator(".photo-deck");
    await expect(decks).toHaveCount(3);
    const first = decks.first();
    await first.getByRole("button", { name: "Фотография 2 из 3" }).click();
    await expect(first.locator("[aria-live]")).toHaveText("2 из 3");
    await expect(decks.nth(1).locator("[aria-live]")).toHaveText("1 из 3");
    await first.getByRole("button", { name: "Фотография 1 из 3" }).click();
    await expect(first.locator("[aria-live]")).toHaveText("1 из 3");
    await first.evaluate((el) => {
      el.dispatchEvent(
        new TouchEvent("touchstart", {
          bubbles: true,
          touches: [
            new Touch({
              identifier: 1,
              target: el,
              clientX: 200,
              clientY: 100,
            }),
          ],
        }),
      );
      el.dispatchEvent(
        new TouchEvent("touchend", {
          bubbles: true,
          changedTouches: [
            new Touch({ identifier: 1, target: el, clientX: 80, clientY: 103 }),
          ],
        }),
      );
    });
    await expect(first.locator("[aria-live]")).toHaveText("2 из 3");
    await first.screenshot({ path: `test-results/photo-deck-${width}.png` });
    await page.goto("/#/invitation?section=gifts");
    await expect(page.locator(".butterfly-anchor")).toHaveCount(5);
    await expect(page.locator(".flower-sprig,.closing-art")).toHaveCount(0);
    await expect(page.locator(".living-art")).toHaveCount(2);
    await page.locator(".heart-note").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/flowers-${width}.png` });
    await page.locator(".venue").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/calendar-${width}.png` });
    await page.goto("/#/memories");
    await expect(page.locator(".wish-card")).toHaveCount(width < 768 ? 8 : 24);
    await page.screenshot({
      path: `test-results/memories-${width}.png`,
      fullPage: true,
    });
    await page.goto("/#/wishlist");
    await expect(page.locator(".filter-tag,.sort-controls")).toHaveCount(0);
    if (width < 768)
      await page.getByRole("button", { name: "Фильтры", exact: true }).click();
    await expect(page.locator(".gift-settings select")).toHaveCount(5);
    await page.screenshot({ path: `test-results/filters-${width}.png` });
  });
}

test("note text and heart share their parent's reveal; raster motion stops when reduced", async ({
  page,
}) => {
  await page.goto("/#/invitation?section=gifts");
  const note = page.locator(".heart-note");
  await note.scrollIntoViewIfNeeded();
  await expect(note).toHaveCSS("opacity", "1");
  expect(
    await note
      .locator(".text-word")
      .evaluateAll((els) => els.every((el) => !el.getAttribute("style"))),
  ).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const displacement of await page.locator("feDisplacementMap").all())
    await expect(displacement).toHaveAttribute("scale", "0");
});

test("activation draws a visible link underline before the internal route change", async ({
  page,
}) => {
  await page.goto("/#/invitation?section=personal");
  const link = page.locator(".paper-link").first();
  await link.click();
  await expect(page).toHaveURL(/#\/personal$/);
  await expect(
    page.getByRole("heading", { name: /Это.*всё.*я/ }),
  ).toBeVisible();
});

test("original flower pixels animate only while the illustration is in view", async ({
  page,
}) => {
  await page.goto("/#/invitation?section=gifts");
  const art = page.locator(".bouquet .living-art");
  await art.evaluate((el) => el.scrollIntoView({ block: "center" }));
  const displacement = art.locator(".flower-displacement");
  const first = await displacement.getAttribute("scale");
  await expect.poll(() => displacement.getAttribute("scale")).not.toBe(first);
  await page.evaluate(() => scrollTo(0, 0));
  await expect
    .poll(async () =>
      art.evaluate((el) => el.getBoundingClientRect().top > innerHeight),
    )
    .toBe(true);
  const paused = await displacement.getAttribute("scale");
  await page.waitForTimeout(150);
  expect(await displacement.getAttribute("scale")).toBe(paused);
});

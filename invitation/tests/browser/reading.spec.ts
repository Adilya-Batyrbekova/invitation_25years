import { test, expect } from "@playwright/test";
test("mobile stories use compact content heights and disclose long text", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/personal");
  await expect(page.locator("main")).toBeFocused();
  const cards = page.locator(".scrap-entry");
  const sizes = await cards.evaluateAll((els) =>
    els.map((el) => el.getBoundingClientRect().height),
  );
  expect(Math.max(...sizes)).toBeLessThan(700);
  expect(sizes[0]).toBeLessThan(844);
  const more = cards.first().getByRole("button", { name: "Далее" });
  await more.click();
  await expect(cards.first()).toHaveAttribute("data-expanded", "true");
  await page.locator(".preferences").scrollIntoViewIfNeeded();
  await expect(cards.first()).toHaveAttribute("data-expanded", "false");
  await page.screenshot({ path: "test-results/reading-stories.png" });
});
for (const width of [390, 1440])
  test(`reading layout ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#/invitation?section=gifts");
    await expect(page.locator("#gifts")).toBeFocused();
    await expect(page.locator(".dress-colours")).toHaveCount(0);
    await page.locator(".venue").scrollIntoViewIfNeeded();
    const geometry = await page.locator(".selected-date").evaluate((el) => {
      const a = el.getBoundingClientRect(),
        b = el.querySelector("svg")!.getBoundingClientRect();
      return {
        x: Math.abs(a.x + a.width / 2 - b.x - b.width / 2),
        y: Math.abs(a.y + a.height / 2 - b.y - b.height / 2),
      };
    });
    expect(geometry.x).toBeLessThan(1);
    expect(geometry.y).toBeLessThan(1);
    await page.screenshot({
      path: `test-results/reading-calendar-${width}.png`,
    });
    await page.goto("/#/memories");
    await expect(page.locator("main")).toBeFocused();
    await expect(page.locator(".demo-wishes-label")).toHaveCount(0);
    if (width < 768) {
      await page.getByRole("button", { name: "Загрузить ещё" }).click();
      await page.getByRole("button", { name: "Загрузить ещё" }).click();
    }
    const group = page.getByRole("button", { name: "Открыть группу" });
    await group.scrollIntoViewIfNeeded();
    await expect(group).toBeVisible();
    await group.click();
    await expect(page.locator("#telegram-dialog")).toBeVisible();
  });

test("mobile story overlays return without a blank RSVP runway", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/personal");
  await expect(page.locator("main")).toBeFocused();
  const group = page.locator(".scrapbook");
  await expect(group).toHaveAttribute("data-stack-ready", "true");
  const top = await group.evaluate(
    (el) => el.getBoundingClientRect().top + scrollY,
  );
  await page.evaluate((y) => scrollTo(0, y + 160), top);
  await expect(page.locator(".scrap-entry").first()).toHaveCSS(
    "position",
    "sticky",
  );
  expect(
    Math.abs(
      (await page.locator(".scrap-entry").first().boundingBox())!.y - 16,
    ),
  ).toBeLessThan(2);
  await page.goto("/#/invitation?section=gifts");
  await expect(page.locator("#gifts")).toBeFocused();
  await expect(page.locator(".venue-rsvp-stack")).toHaveAttribute(
    "data-stack-ready",
    "true",
  );
  const gap = await page.evaluate(
    () =>
      document.querySelector(".flowers")!.getBoundingClientRect().top -
      document.querySelector(".rsvp")!.getBoundingClientRect().bottom,
  );
  // The opaque next section may overlap the sticky form, but must not leave a positive blank gap.
  expect(gap).toBeLessThan(3);
  await expect(page.locator(".venue-rsvp-stack > .stack-tail")).toHaveCount(0);
});

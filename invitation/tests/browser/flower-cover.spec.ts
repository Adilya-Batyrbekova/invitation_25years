import { test, expect } from "@playwright/test";
for (const width of [390, 1440]) {
  test(`flower section follows the form without overlap at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/invitation?section=personal");
    await expect(page.locator("#personal")).toBeFocused();
    const group = page.locator(".venue-rsvp-stack");
    await expect(group).toHaveAttribute("data-stack-ready", "true");
    const flowers = page.locator(".flowers");
    const position = await flowers.evaluate(
      (el) => el.getBoundingClientRect().top + scrollY,
    );
    await page.evaluate((y) => scrollTo(0, y - 16), position);
    await expect(page.locator(".venue")).toHaveCSS("opacity", "1");
    const form = await page.locator(".rsvp").boundingBox();
    expect(form!.height).toBeGreaterThan(0);
    const flowerBounds = (await flowers.boundingBox())!;
    expect(flowerBounds.y - (form!.y + form!.height)).toBeGreaterThanOrEqual(
      -1,
    );
    expect(
      await flowers.evaluate((el) =>
        el.contains(document.elementFromPoint(innerWidth / 2, 40)),
      ),
    ).toBe(true);
    await page.screenshot({ path: `test-results/flower-cover-${width}.png` });
    await page.evaluate((y) => scrollTo(0, y - 216), position);
    expect((await flowers.boundingBox())!.y).toBeGreaterThan(210);
    expect(
      await page
        .locator(".rsvp")
        .evaluate((el) =>
          el.contains(document.elementFromPoint(innerWidth / 2, 100)),
        ),
    ).toBe(true);
  });
}
test("reduced motion keeps all three sections readable in ordinary flow", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/invitation?section=gifts");
  for (const selector of [".venue", ".rsvp", ".flowers"])
    await expect(page.locator(selector)).toHaveCSS("position", "relative");
});

import { test, expect } from "@playwright/test";
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
  await page.route("**/invitation-personal.json", (route) =>
    route.fulfill({ status: 404 }),
  );
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
  const first = page.locator(".scrap-entry").first();
  const height = await first.evaluate((el) => (el as HTMLElement).offsetHeight);
  await expect
    .poll(async () => (await first.boundingBox())!.height)
    .toBeLessThan(height);
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
  // The flower section must neither cover the form nor leave an artificial runway.
  expect(gap).toBeGreaterThanOrEqual(-1);
  expect(gap).toBeLessThan(3);
  await expect(page.locator(".venue-rsvp-stack > .stack-tail")).toHaveCount(0);
});

test("late personal content stacks every card and keeps the three-color cycle", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let release!: () => void;
  const load = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/invitation-personal.json", async (route) => {
    await load;
    await route.fulfill({
      json: {
        intro: "Synthetic introduction",
        stories: Array.from({ length: 8 }, (_, id) => ({
          id,
          title: "Synthetic story " + (id + 1),
          description: "A synthetic story with enough text to verify stacking.",
          label: "Synthetic photo",
          photos: id === 0 ? ["art/bouquet.webp"] : [],
        })),
        preferences: Array.from({ length: 6 }, (_, index) => ({
          label: "Synthetic preference " + (index + 1),
          value: "Sample",
        })),
      },
    });
  });
  await page.goto("/#/personal");
  const cards = page.locator(".scrap-entry");
  await expect(cards).toHaveCount(4);
  release();
  await expect(cards).toHaveCount(8);
  await expect(cards.last()).toHaveCSS("z-index", "8");
  await expect(cards.first().locator("img")).toBeVisible();
  await expect
    .poll(() =>
      cards
        .first()
        .locator("img")
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
  await expect(cards.nth(1).locator(".photo-deck")).toHaveCount(0);

  const colors = await cards.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).backgroundColor),
  );
  const notes = await page
    .locator(".preference-notes > p")
    .evaluateAll((elements) =>
      elements.map(
        (element) => getComputedStyle(element, "::before").backgroundColor,
      ),
    );
  for (const cycle of [colors, notes]) {
    expect(new Set(cycle.slice(0, 3)).size).toBe(3);
    expect(cycle).toEqual(cycle.map((_, index) => cycle[index % 3]));
  }

  const tops = await cards.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().top + scrollY),
  );
  for (let index = 4; index < tops.length; index++) {
    await page.evaluate((top) => scrollTo(0, top - 16), tops[index]);
    await expect
      .poll(() =>
        page.evaluate(() =>
          document
            .elementFromPoint(innerWidth / 2, 45)
            ?.closest(".scrap-entry")
            ?.querySelector("h2")
            ?.textContent?.replaceAll("\u00a0", " "),
        ),
      )
      .toBe("Synthetic story " + (index + 1));
  }
});

test("wishlist categories combine, toggle off and retain state across views", async ({
  page,
}) => {
  await page.goto("/#/wishlist?view=gifts");
  const books = page.getByRole("button", { name: "Книги", exact: true });
  const home = page.getByRole("button", { name: "Для дома", exact: true });
  await books.click();
  await home.click();
  await expect(page.locator(".gift-card")).toHaveCount(4);
  await books.click();
  await expect(page.locator(".gift-card")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Что мне нравится", exact: true })
    .click();
  await expect(page.locator(".gift-grid")).not.toBeVisible();
  await page
    .locator(".gift-ideas > article")
    .first()
    .getByRole("button", { name: "Увеличить иллюстрацию 1" })
    .click();
  await expect(page.locator(".idea-lightbox")).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(page.locator(".idea-lightbox")).not.toBeVisible();
  await page.getByRole("button", { name: "Вишлист", exact: true }).click();
  await expect(home).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".gift-card")).toHaveCount(3);
});
for (const width of [390, 1440]) {
  test(`currency fallback stays below the filter grid at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/wishlist?view=gifts");
    await page.getByRole("button", { name: "Фильтры", exact: true }).click();
    await page.getByRole("radio", { name: "Рубли" }).check();
    const fields = page.locator(".filter-fields");
    const notice = page.locator(".currency-note");
    const reset = page.getByRole("button", { name: "Сбросить" });
    await expect(notice).toBeVisible();
    const grid = (await fields.boundingBox())!;
    const note = (await notice.boundingBox())!;
    const button = (await reset.boundingBox())!;
    expect(note.y).toBeGreaterThanOrEqual(grid.y + grid.height);
    expect(Math.abs(note.x - grid.x)).toBeLessThan(1);
    expect(
      Math.abs(button.x + button.width - grid.x - grid.width),
    ).toBeLessThan(1);
  });
}

test("personal stories show all four descriptions and rotate visible photos", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/personal");
  const cards = page.locator(".scrap-entry");
  await expect(cards).toHaveCount(4);
  await expect(cards.getByRole("button", { name: "Далее" })).toHaveCount(0);
  const first = cards.first();
  await first.scrollIntoViewIfNeeded();
  await expect(first.locator(".story-body")).toBeVisible();
  await expect(first.locator(".photo-controls button").nth(1)).toHaveAttribute(
    "aria-pressed",
    "true",
    { timeout: 5000 },
  );
});

test("short personal descriptions do not reserve empty text space", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/personal");
  const sizes = await page.locator(".scrap-entry").evaluateAll((cards) =>
    cards.map((card) => {
      const story = card.querySelector(".story")!;
      const last = story.lastElementChild!;
      return {
        height: card.getBoundingClientRect().height,
        blank:
          story.getBoundingClientRect().bottom -
          last.getBoundingClientRect().bottom,
      };
    }),
  );
  expect(sizes[1].height).toBeLessThan(sizes[0].height);
  expect(sizes[3].height).toBeLessThan(sizes[2].height);
  for (const card of sizes) expect(card.blank).toBeLessThanOrEqual(16);
});

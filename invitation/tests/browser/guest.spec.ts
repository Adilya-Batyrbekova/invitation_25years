import { test, expect } from "@playwright/test";
test("envelope opens by keyboard and does not replay in this tab", async ({
  page,
}) => {
  await page.goto("/");
  const open = page.getByRole("button", { name: /Открыть.*приглашение/ });
  await open.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Мне 25!" })).toBeVisible();
  await page.reload();
  await expect(open).toHaveCount(0);
});
test("attendance failure retains the entered name and choice", async ({
  page,
}) => {
  await page.goto("/#/invitation?section=gifts");
  await page.getByRole("textbox", { name: /Твоё.*имя/ }).fill("Тестовый гость");
  await page.getByRole("radio", { name: "Приду", exact: true }).check();
  await page.getByRole("button", { name: /Отправить.*ответ/ }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Не получилось отправить",
  );
  await expect(page.getByRole("textbox", { name: /Твоё.*имя/ })).toHaveValue(
    "Тестовый гость",
  );
  await expect(
    page.getByRole("radio", { name: "Приду", exact: true }),
  ).toBeChecked();
});
test("wishlist filters, dialog escape and contextual direct return", async ({
  page,
}) => {
  await page.goto("/#/wishlist");
  await expect(page.locator(".gift-card")).toHaveCount(6);
  await page.locator(".gift-settings summary").click();
  await page
    .getByRole("combobox", { name: "Категория", exact: true })
    .selectOption("Книги");
  await expect(page.locator(".gift-card")).toHaveCount(1);
  await page.locator(".gift-card").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("link", { name: "Приглашение" }).click();
  await expect(page).toHaveURL(/section=gifts/);
  await expect(page.locator("#gifts")).toBeFocused();
});
test("wish is not falsely published and its text survives failure", async ({
  page,
}) => {
  await page.goto("/#/memories");
  await page.getByRole("textbox", { name: /Твоё.*имя/ }).fill("Тест");
  await page
    .getByRole("textbox", { name: /Твоя.*открытка/ })
    .fill("Тёплые слова <b>остаются текстом</b>");
  await page.getByRole("button", { name: /Опубликовать.*пожелание/ }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: /Твоя.*открытка/ }),
  ).toHaveValue("Тёплые слова <b>остаются текстом</b>");
  await expect(page.locator(".empty-wishes")).toBeVisible();
});
test("reduced motion exposes content without animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/personal");
  await expect(
    page.getByRole("heading", { name: /Это.*всё.*я/ }),
  ).toBeVisible();
  const hidden = await page
    .locator(".written-char")
    .evaluateAll((chars) =>
      chars.some((el) => getComputedStyle(el).opacity === "0"),
    );
  expect(hidden).toBe(false);
});
test("one music control starts audio, pauses it and preserves the pause", async ({
  page,
}) => {
  await page.goto("/");
  const control = page.locator(".atmosphere-controls button");
  await expect(control).toHaveCount(1);
  await page.getByRole("button", { name: /Открыть.*приглашение/ }).click();
  await expect(control).toHaveAttribute("aria-pressed", "true");
  await control.click();
  await expect(control).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".hero-title")).toBeVisible();
  await page.locator(".hero-subtitle").click();
  await expect(control).toHaveAttribute("aria-pressed", "false");
  await control.click();
  await expect(control).toHaveAttribute("aria-pressed", "true");
});
for (const [width, height] of [
  [320, 568],
  [390, 844],
  [844, 390],
  [1440, 900],
  [1920, 900],
  [3840, 900],
])
  test(`envelope fits ${width}x${height} without scrolling`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    const metrics = await page.evaluate(() => {
      const caption = document
        .querySelector(".envelope-caption")!
        .getBoundingClientRect();
      const button = document
        .querySelector(".envelope")!
        .getBoundingClientRect();
      return {
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        bottom: caption.bottom,
        top: button.top,
      };
    });
    expect(metrics.width).toBeLessThanOrEqual(width + 1);
    expect(metrics.height).toBeLessThanOrEqual(height + 1);
    expect(metrics.bottom).toBeLessThanOrEqual(height);
    expect(metrics.top).toBeGreaterThan(0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: /Открыть.*приглашение/ }).click();
    const hero = await page.locator(".hero").boundingBox();
    expect(hero!.height).toBeLessThanOrEqual(height + 1);
  });
test("letter comes in front of the envelope before the page transition", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Открыть.*приглашение/ }).click();
  await expect(page.locator(".envelope-letter")).toHaveCSS("z-index", "6");
  const visible = await page.locator(".envelope-letter").evaluate((el) => {
    const r = el.getBoundingClientRect();
    return el.contains(
      document.elementFromPoint(r.x + r.width / 2, r.y + r.height * 0.7),
    );
  });
  expect(visible).toBe(true);
});
test("hero text is sequential and restarts after leaving the viewport", async ({
  page,
}) => {
  await page.goto("/#/invitation?section=personal");
  await page.evaluate(() => scrollTo(0, 0));
  const subtitle = page.locator(".hero-subtitle");
  await expect(subtitle).toHaveCSS("opacity", "0");
  await expect(subtitle).toHaveCSS("opacity", "1");
  await expect(page.locator(".paint-date")).toHaveCSS("opacity", "1");
  await expect(page.locator(".hero .ink-art")).toHaveCSS("opacity", "1");
  await page.locator(".rsvp").scrollIntoViewIfNeeded();
  await expect(subtitle).toHaveCSS("opacity", "0");
  await page.evaluate(() => scrollTo(0, 0));
  await expect(subtitle).toHaveCSS("opacity", "1");
});
test("wishlist link softly reveals again when approached from below", async ({
  page,
}) => {
  // The compact layout leaves a few pixels visible at the bottom of a 720px viewport.
  // Use a shorter viewport so the test actually exercises a complete leave/re-entry.
  await page.setViewportSize({ width: 1280, height: 640 });
  await page.goto("/#/invitation?section=gifts");
  const link = page.locator(".flower-copy .text-link");
  await link.scrollIntoViewIfNeeded();
  await expect(link).toHaveCSS("opacity", "1");
  await page.locator(".contact").scrollIntoViewIfNeeded();
  expect(
    (await link.boundingBox())!.y + (await link.boundingBox())!.height,
  ).toBeLessThanOrEqual(0);
  await expect(link).toHaveCSS("opacity", "0");
  await link.scrollIntoViewIfNeeded();
  await expect(link).toHaveAttribute("data-reveal-direction", "backward");
  await expect(link).toHaveCSS("opacity", "1");
});
test("attendance choices share a center line", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/invitation?section=gifts");
  const labels = await page.locator(".radio").evaluateAll((elements) =>
    elements.map((el) => {
      const rect = el.getBoundingClientRect();
      const input = el.querySelector("input")!.getBoundingClientRect();
      return {
        center: rect.y + rect.height / 2,
        input: input.y + input.height / 2,
      };
    }),
  );
  expect(Math.abs(labels[0].center - labels[1].center)).toBeLessThanOrEqual(1);
  labels.forEach((label) =>
    expect(Math.abs(label.center - label.input)).toBeLessThanOrEqual(1),
  );
});
test("painted ambient motion respects reduced motion", async ({ page }) => {
  await page.goto("/#/invitation?section=personal");
  const wing = page.locator(".butterfly-left");
  await expect(wing).toHaveCSS("animation-name", "butterfly-flap");
  await expect(page.locator(".bouquet-drift")).toHaveCSS(
    "animation-name",
    "bouquet-hover",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(wing).toHaveCSS("animation-name", "none");
  await expect(page.locator(".bouquet-drift")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator(".hero .ink-art")).toHaveCSS("opacity", "1");
});
for (const width of [320, 390, 768, 1440, 1920, 2560, 3840])
  test(`content fits ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of [
      "invitation?section=personal",
      "personal",
      "memories",
      "wishlist",
    ]) {
      await page.goto("/#/" + route);
      await expect(page.locator("main")).toBeVisible();
      const size = await page.evaluate(() => ({
        viewport: innerWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(size.scroll).toBeLessThanOrEqual(size.viewport + 1);
      const overflowingCopy = await page
        .locator(
          "main h1, main h2, main p, main input, main textarea, main select",
        )
        .evaluateAll((elements) =>
          elements
            .filter((el) => {
              const rect = el.getBoundingClientRect();
              return (
                rect.width > 0 &&
                (rect.left < -1 ||
                  rect.right > innerWidth + 1 ||
                  el.scrollWidth > el.clientWidth + 1)
              );
            })
            .map((el) => el.textContent?.slice(0, 60)),
        );
      expect(overflowingCopy).toEqual([]);
      if (route !== "invitation?section=personal") {
        const main = await page.locator("main").boundingBox();
        const dock = await page.locator(".return-dock").boundingBox();
        expect(main!.y + main!.height).toBeLessThanOrEqual(dock!.y + 1);
        const contentFits = await page
          .locator("main")
          .evaluate((el) => el.scrollWidth <= el.clientWidth + 1);
        expect(contentFits).toBe(true);
      }
      expect(
        await page
          .locator("img")
          .evaluateAll((images) =>
            images.some((i) => i.complete && !i.naturalWidth),
          ),
      ).toBe(false);
    }
  });

test("mobile has one garland and a compact hero with square ornaments", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/invitation?section=personal");
  await expect(page.locator(".garland img:visible")).toHaveCount(1);
  expect(
    (await page.locator(".hero").boundingBox())!.height,
  ).toBeLessThanOrEqual(680);
  const ornaments = await page
    .locator(".hero .doodle, .date-flower")
    .evaluateAll((elements) =>
      elements.map((el) => {
        const r = el.getBoundingClientRect();
        return { w: r.width, h: r.height };
      }),
    );
  ornaments.forEach((r) => expect(Math.abs(r.w - r.h)).toBeLessThanOrEqual(1));
});
test("script letters have real animated contours and complete their fill", async ({
  page,
}) => {
  await page.goto("/#/invitation?section=personal");
  await page.evaluate(() => scrollTo(0, 0));
  const contour = page.locator(".hero-title .glyph-contour").first();
  await expect(contour).toHaveAttribute("d", /^M/);
  await expect
    .poll(() =>
      contour.evaluate((el) =>
        parseFloat(getComputedStyle(el).strokeDashoffset),
      ),
    )
    .toBeGreaterThan(0);
  await expect(contour).toHaveCSS("stroke-dashoffset", "0px");
  await expect(page.locator(".hero-title .glyph-fill").last()).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(page.getByRole("heading", { name: "Мне 25!" })).toHaveCount(1);
});
test("RSVP rides over the venue and reverses on upward scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/invitation?section=personal");
  const group = page.locator(".venue-rsvp-stack");
  await expect(group).toHaveAttribute("data-stack-ready", "true");
  const start = await group.evaluate(
    (el) => el.getBoundingClientRect().top + scrollY,
  );
  await page.evaluate((y) => scrollTo(0, y + 80), start);
  const before = (await page.locator(".rsvp").boundingBox())!.y;
  await page.evaluate((y) => scrollTo(0, y + 280), start);
  const after = (await page.locator(".rsvp").boundingBox())!.y;
  const venue = (await page.locator(".venue").boundingBox())!.y;
  expect(after).toBeLessThan(before - 100);
  expect(Math.abs(venue - 16)).toBeLessThan(20);
  await page.evaluate((y) => scrollTo(0, y + 80), start);
  expect((await page.locator(".rsvp").boundingBox())!.y).toBeGreaterThan(
    after + 100,
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".venue")).toHaveCSS("position", "relative");
});
test("personal cards stack and a covered venue link can receive usable focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#/personal");
  await expect(page.locator(".scrapbook")).toHaveAttribute(
    "data-stack-ready",
    "true",
  );
  await expect(page.locator(".scrap-entry").first()).toHaveCSS(
    "position",
    "sticky",
  );
  await page
    .locator(".scrap-entry .story")
    .first()
    .evaluate((el) => {
      const fixture = document.createElement("p");
      fixture.dataset.testLongStory = "true";
      fixture.textContent =
        "Synthetic long story for viewport testing. ".repeat(250);
      el.append(fixture);
    });
  await expect(page.locator(".scrapbook")).toHaveAttribute(
    "data-stack-ready",
    "false",
  );
  await expect(page.locator(".scrap-entry").first()).toHaveCSS(
    "position",
    "relative",
  );
  await page.locator("[data-test-long-story]").evaluate((el) => el.remove());
  await expect(page.locator(".scrapbook")).toHaveAttribute(
    "data-stack-ready",
    "true",
  );
  await page.goto("/#/invitation?section=gifts");
  const link = page.locator(".venue .button");
  await link.focus();
  await expect(link).toBeFocused();
  await expect
    .poll(() =>
      link.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return el.contains(
          document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
        );
      }),
    )
    .toBe(true);
});

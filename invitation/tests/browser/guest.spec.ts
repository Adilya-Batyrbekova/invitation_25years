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
  await page
    .getByRole("combobox", { name: "Категория", exact: true })
    .selectOption("Книги");
  await expect(page.locator(".gift-card")).toHaveCount(1);
  await page.locator(".gift-open").click();
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
  expect(
    await page.locator(".written-char,.text-word").count(),
  ).toBeGreaterThan(0);
  const hidden = await page
    .locator(".written-char,.text-word")
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
  const link = page.locator(".flower-copy > .word-copy").last();
  await link.scrollIntoViewIfNeeded();
  await expect(link.locator(".text-word").last()).toHaveCSS("opacity", "1");
  await page.locator(".contact").scrollIntoViewIfNeeded();
  expect(
    (await link.boundingBox())!.y + (await link.boundingBox())!.height,
  ).toBeLessThanOrEqual(0);
  await expect(link.locator(".text-word").last()).toHaveCSS("opacity", "0");
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
  const wing = page.locator(".hero .butterfly-left");
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
        expect(main!.width).toBeLessThanOrEqual(width);
        await expect(page.locator(".return-dock")).toHaveCount(0);
        await expect(page.locator(".return-link")).toHaveCSS(
          "position",
          "fixed",
        );
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
test("script reveals filled glyphs without contour drawing", async ({
  page,
}) => {
  await page.goto("/#/invitation?section=personal");
  await page.evaluate(() => scrollTo(0, 0));
  await expect(page.locator(".hero-title .written-char").last()).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(page.locator(".glyph-contour")).toHaveCount(0);
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
  await expect(page.locator(".venue-copy h2 .written-char").last()).toHaveCSS(
    "opacity",
    "1",
  );
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

test("compact meeting combines date and venue without an opaque stack rectangle", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#/invitation?section=gifts");
  const venue = page.locator(".venue");
  expect((await venue.boundingBox())!.height).toBeLessThan(700);
  await expect(page.locator(".greeting,.date-section")).toHaveCount(0);
  await expect(venue.locator(".calendar .selected-date")).toHaveText("28");
  await expect(venue).toContainText("Абая, 89");
  await expect(venue.locator(".button")).toHaveAttribute("href", /2089$/);
  await expect(page.locator(".rsvp")).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
});

test("filters remain open after scrolling and preserve selections", async ({
  page,
}) => {
  await page.goto("/#/wishlist");
  await page
    .getByRole("button", { name: "Сначала дороже", exact: true })
    .click();
  await page.getByRole("button", { name: /От.*5.*000/ }).click();
  await page.mouse.wheel(0, 150);
  await expect(page.locator(".gift-settings select").first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Сначала дороже", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".gift-card")).toHaveCount(5);
  await page.getByRole("button", { name: "Сбросить", exact: true }).click();
  await expect(page.locator(".gift-card")).toHaveCount(6);
});

test("quick reservation stays in the catalogue and retains input on failure", async ({
  page,
}) => {
  await page.goto("/#/wishlist");
  const card = page.locator(".gift-card").first();
  await card
    .getByRole("button", { name: "Забронировать", exact: true })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await card.getByRole("textbox").fill("Синтетический гость");
  await card
    .getByRole("button", { name: "Подтвердить бронь", exact: true })
    .click();
  await expect(card.getByRole("alert")).toContainText(
    "Не получилось отправить",
  );
  await expect(card.getByRole("textbox")).toHaveValue("Синтетический гость");
  await expect(
    card.getByRole("button", { name: "Забронировать", exact: true }),
  ).toBeEnabled();
  await expect(
    card.getByRole("button", { name: "В магазин", exact: true }),
  ).toBeDisabled();
  await card.getByRole("button", { name: /Подробнее:/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(card.getByRole("button", { name: /Подробнее:/ })).toBeFocused();
});

test("gift cards have equal size while their text and price stay grouped", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#/wishlist");
  await expect(
    page.locator(".gift-category,.gift-arrow,.gift-bottom"),
  ).toHaveCount(0);
  await page
    .locator(".gift-name")
    .first()
    .evaluate(
      (el) =>
        (el.textContent =
          "Synthetic long gift title with several lines to test card size"),
    );
  const heights = await page
    .locator(".gift-card")
    .evaluateAll((items) =>
      items.map((el) => el.getBoundingClientRect().height),
    );
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
  const gaps = await page
    .locator(".gift-info")
    .evaluateAll((items) =>
      items.map(
        (el) =>
          el.querySelector(".gift-price")!.getBoundingClientRect().top -
          el.querySelector(".gift-description")!.getBoundingClientRect().bottom,
      ),
    );
  gaps.forEach((gap) => expect(gap).toBeLessThan(20));
});

test("body words wait for the heading and replay on upward entry", async ({
  page,
}) => {
  await page.goto("/#/personal");
  const heading = page.locator(".subpage-intro h1");
  const copy = page.locator(".subpage-intro p");
  const overlaps = await page.evaluate(async () => {
    let overlap = false;
    const heading = document.querySelector(".subpage-intro h1")!;
    const words = [...heading.querySelectorAll(".written-char")];
    const copy = document.querySelector(".subpage-intro p .text-word")!;
    const deadline = performance.now() + 1600;
    while (performance.now() < deadline) {
      if (
        parseFloat(getComputedStyle(copy).opacity) > 0.01 &&
        words.some((word) => parseFloat(getComputedStyle(word).opacity) < 0.99)
      )
        overlap = true;
      await new Promise(requestAnimationFrame);
    }
    return overlap;
  });
  expect(overlaps).toBe(false);
  await expect(heading.locator(".written-char").last()).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(copy.locator(".text-word").last()).toHaveCSS("opacity", "1");
  await page.locator(".preferences").scrollIntoViewIfNeeded();
  await expect(copy.locator(".text-word").last()).toHaveCSS("opacity", "0");
  await copy.scrollIntoViewIfNeeded();
  await expect(copy).toHaveAttribute("data-reveal-direction", "backward");
  await expect(copy.locator(".text-word").last()).toHaveCSS("opacity", "1");
});

test("floating return leaves the final controls reachable without a footer", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["wishlist", "memories", "personal"]) {
    // Hash changes reuse the main node; clear old focus before waiting for route focus restoration.
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
    });
    await page.goto("/#/" + route);
    await expect(page.locator("main")).toBeFocused();
    await page.evaluate(() =>
      scrollTo(0, document.documentElement.scrollHeight),
    );
    const last = page
      .locator(
        route === "wishlist"
          ? ".gift-actions"
          : route === "memories"
            ? ".telegram-section .button"
            : ".preference-notes p",
      )
      .last();
    const content = await last.boundingBox();
    const button = await page.locator(".return-link").boundingBox();
    expect(content!.y + content!.height).toBeLessThan(button!.y);
    expect(button!.y + button!.height).toBeLessThanOrEqual(844);
    await expect(page.locator(".return-dock")).toHaveCount(0);
  }
});

test("sticky venue heading remains visible while RSVP overlays its lower edge", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#/invitation?section=personal");
  await expect(page.locator("#personal")).toBeFocused();
  const group = page.locator(".venue-rsvp-stack");
  await expect(group).toHaveAttribute("data-stack-ready", "true");
  const start = await group.evaluate(
    (el) => el.getBoundingClientRect().top + scrollY,
  );
  await page.evaluate((y) => scrollTo(0, y + 260), start);
  await expect(page.locator(".venue-copy h2 .written-char").last()).toHaveCSS(
    "opacity",
    "1",
  );
});

test("envelope remains opaque and its card covers the invitation line", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Открыть.*приглашение/ }).click();
  await expect(page.locator(".envelope")).toBeDisabled();
  await expect(page.locator(".envelope")).toHaveCSS("opacity", "1");
  await expect(page.locator(".envelope-letter")).toHaveCSS(
    "border-radius",
    "18px",
  );
  await expect(page.locator(".envelope-letter")).toHaveCSS("z-index", "6");
  await expect
    .poll(
      () =>
        page.locator(".envelope-letter").evaluate((el) => {
          const card = el.getBoundingClientRect();
          const caption = document
            .querySelector(".envelope-kicker")!
            .getBoundingClientRect();
          const x = caption.x + caption.width / 2;
          const y = caption.y + caption.height / 2;
          return (
            card.top < y &&
            card.bottom > y &&
            el.contains(document.elementFromPoint(x, y))
          );
        }),
      { timeout: 1600, intervals: [30] },
    )
    .toBe(true);
});

test("stacked layers stay full width and personal papers never turn transparent", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#/invitation?section=personal");
  await expect(page.locator("#personal")).toBeFocused();
  const start = await page
    .locator(".venue-rsvp-stack")
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await page.evaluate((y) => scrollTo(0, y + 300), start);
  await expect(page.locator(".venue")).toHaveCSS("opacity", "1");
  await expect(page.locator(".venue")).toHaveCSS("transform", "none");
  expect((await page.locator(".venue").boundingBox())!.width).toBe(1440);
  await page.goto("/#/personal");
  const third = page.locator(".scrap-entry").nth(2);
  await third.scrollIntoViewIfNeeded();
  for (const card of await page.locator(".scrap-entry").all())
    await expect(card).toHaveCSS("opacity", "1");
});

test("RSVP submit stays inside its yellow shape on a small phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/invitation?section=gifts");
  const rsvp = page.locator(".rsvp");
  await rsvp.scrollIntoViewIfNeeded();
  const inside = await rsvp.evaluate((el) => {
    const button = el
      .querySelector(".guest-form .button")!
      .getBoundingClientRect();
    const svg = el.querySelector<SVGSVGElement>(".rsvp-surface")!;
    const path = svg.querySelectorAll("path")[1];
    const inverse = path.getScreenCTM()!.inverse();
    return [button.left + 3, button.right - 3].every((x) => {
      const point = svg.createSVGPoint();
      point.x = x;
      point.y = button.bottom - 2;
      return path.isPointInFill(point.matrixTransform(inverse));
    });
  });
  expect(inside).toBe(true);
  const title = await page.locator(".rsvp-heading").boundingBox();
  const form = await page.locator(".rsvp .guest-form").boundingBox();
  expect(form!.y - (title!.y + title!.height)).toBeLessThan(150);
});

test("contact goes directly to the supplied Telegram and supporting text stays sans serif", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/invitation?section=gifts");
  await expect(page.locator(".contact-link")).toHaveAttribute(
    "href",
    "https://t.me/ADelhi",
  );
  await expect(page.locator("#contact-dialog,.contact h2")).toHaveCount(0);
  await page.goto("/#/personal");
  await expect(page.locator(".subpage-intro > .doodle")).toHaveCount(0);
  const font = await page
    .locator(".preference-notes p > span:not(.text-word)")
    .first()
    .evaluate((el) => getComputedStyle(el).fontFamily);
  expect(font).toContain("Nunito");
  await page.goto("/#/memories");
  await expect(
    page.locator(".subpage-intro > .doodle,.telegram-art,.memory-star"),
  ).toHaveCount(0);
  await expect(page.locator("h1")).toHaveCount(1);
});

test("gift details ask for a name only after the reservation action", async ({
  page,
}) => {
  await page.goto("/#/wishlist");
  await page.locator(".gift-open").first().click();
  const dialog = page.locator(".gift-dialog");
  await expect(dialog.getByRole("textbox")).toHaveCount(0);
  await dialog
    .getByRole("button", { name: "Забронировать", exact: true })
    .click();
  const input = dialog.getByRole("textbox", { name: /Твоё.*имя/ });
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("placeholder", /Твоё.*имя/);
  await input.fill("Тестовый даритель");
  await dialog
    .getByRole("button", { name: "Подтвердить бронь", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toBeVisible();
  await expect(input).toHaveValue("Тестовый даритель");
  await expect(dialog.locator("h2")).toHaveCSS("font-family", /Nunito/);
});

test("gallery, optional accordion and unavailable reservation use synthetic catalogue data", async ({
  page,
}) => {
  await page.route("**/src/data/content.ts*", async (route) => {
    const response = await route.fetch();
    const source = await response.text();
    await route.fulfill({
      response,
      body:
        source +
        '\ngifts[0].images=[{src:"/art/bouquet.webp",alt:"Synthetic first image"},{src:"/art/flower-sprig.png",alt:"Synthetic second image"}];gifts[0].note="Synthetic optional gift note";gifts[1].availability="reserved";',
    });
  });
  await page.goto("/#/wishlist");
  await expect(
    page
      .locator(".gift-card")
      .nth(1)
      .getByRole("button", { name: "Забронировано", exact: true }),
  ).toBeDisabled();
  await page.locator(".gift-open").first().click();
  const dialog = page.locator(".gift-dialog");
  await dialog.getByRole("button", { name: /Фотография.*2.*из.*2/ }).click();
  await expect(dialog.locator(".dialog-picture img")).toHaveAttribute(
    "alt",
    "Synthetic second image",
  );
  await expect(
    dialog.getByText("Synthetic optional gift note"),
  ).not.toBeVisible();
  await dialog.locator(".gift-note summary").click();
  await expect(dialog.getByText("Synthetic optional gift note")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".gift-open").first()).toBeFocused();
});

test("personal and contact links draw the same curved underline on hover", async ({
  page,
}) => {
  await page.goto("/#/invitation?section=personal");
  for (const link of [
    page.locator(".paper-link").first(),
    page.locator(".contact-link"),
  ]) {
    const line = link.locator(".hand-underline path");
    await expect(line).toHaveAttribute("d", /C.*S/);
    await expect(line).toHaveCSS("stroke-dashoffset", "1px");
    await link.hover();
    await expect(line).toHaveCSS("stroke-dashoffset", "0px");
  }
});

test("time text and its rounded badge reveal and reset as one object", async ({
  page,
}) => {
  await page.goto("/#/invitation?section=personal");
  await expect(page.locator("#personal")).toBeFocused();
  await page.evaluate(() => scrollTo(0, 0));
  const time = page.locator(".time-note");
  await expect(time).toHaveCSS("opacity", "0");
  for (const word of await time.locator(".text-word").all())
    await expect(word).toHaveCSS("opacity", "1");
  await time.scrollIntoViewIfNeeded();
  await expect(time).toHaveCSS("opacity", "1");
  await expect(time).toHaveCSS("border-radius", "999px");
});

for (const width of [390, 1440])
  test(`RSVP fully covers the pinned venue at ${width}px and reverses`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/invitation?section=personal");
    await expect(page.locator("#personal")).toBeFocused();
    const group = page.locator(".venue-rsvp-stack");
    await expect(group).toHaveAttribute("data-stack-ready", "true");
    const pose = await group.evaluate((el) => {
      const card = el.querySelector<HTMLElement>(".rsvp")!;
      const normal =
        el.getBoundingClientRect().top +
        scrollY +
        el.querySelector<HTMLElement>(".venue")!.offsetHeight;
      return (
        normal -
        parseFloat(getComputedStyle(el).getPropertyValue("--rsvp-cover-top"))
      );
    });
    await page.evaluate((y) => scrollTo(0, y), pose);
    const venue = page.locator(".venue");
    await expect(venue).toHaveCSS("transform", "none");
    expect(Math.abs((await venue.boundingBox())!.y - 16)).toBeLessThan(2);
    const covered = await group.evaluate((el) => {
      const venue = el.querySelector(".venue")!.getBoundingClientRect();
      const svg = el.querySelector<SVGSVGElement>(".rsvp-surface")!;
      const inverse = svg.getScreenCTM()!.inverse();
      const paths = [...svg.querySelectorAll("path")];
      return [
        venue.left + 2,
        venue.right - 2,
        venue.left + venue.width / 2,
      ].every((x) =>
        [venue.top + 2, Math.min(innerHeight - 2, venue.bottom - 2)].every(
          (y) => {
            const point = svg.createSVGPoint();
            point.x = x;
            point.y = y;
            return paths.some((path) =>
              path.isPointInFill(point.matrixTransform(inverse)),
            );
          },
        ),
      );
    });
    expect(covered).toBe(true);
    const before = (await page.locator(".rsvp").boundingBox())!.y;
    await page.evaluate((y) => scrollTo(0, y - 220), pose);
    expect((await page.locator(".rsvp").boundingBox())!.y).toBeGreaterThan(
      before + 100,
    );
  });

for (const width of [390, 1440])
  test(`only the selected reservation card grows at ${width}px`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/wishlist");
    await page.evaluate(() => document.fonts.ready);
    const cards = page.locator(".gift-card");
    await expect
      .poll(() =>
        cards.evaluateAll(
          (els) =>
            Math.max(...els.map((el) => el.getBoundingClientRect().height)) -
            Math.min(...els.map((el) => el.getBoundingClientRect().height)),
        ),
      )
      .toBeLessThanOrEqual(1);
    const initial = await cards.evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect().height),
    );
    await cards
      .first()
      .getByRole("button", { name: "Забронировать", exact: true })
      .click();
    const input = cards.first().getByRole("textbox");
    await expect(input).toBeFocused();
    await expect(input).toHaveCSS("outline-style", "none");
    await expect(input).toHaveCSS("outline-width", "0px");
    const expanded = await cards.evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect().height),
    );
    expect(expanded[0]).toBeGreaterThan(initial[0] + 60);
    for (let i = 1; i < initial.length; i++)
      expect(Math.abs(expanded[i] - initial[i])).toBeLessThanOrEqual(1);
    await cards
      .first()
      .getByRole("button", { name: "Забронировать", exact: true })
      .click();
    await expect
      .poll(() =>
        cards.first().evaluate((el) => el.getBoundingClientRect().height),
      )
      .toBeCloseTo(initial[0], 0);
  });

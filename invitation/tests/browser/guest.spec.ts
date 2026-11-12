import { test, expect } from "@playwright/test";
import { installModerationPreview } from "../fixtures/moderation-preview.mjs";
test("envelope opens by keyboard and does not replay in this tab", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Без музыки", exact: true }).click();
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
  await page.getByRole("button", { name: "Отправить" }).click();
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
  await page.goto("/#/wishlist?view=gifts");
  await expect(page.locator(".gift-card")).toHaveCount(6);
  await page.getByRole("button", { name: "Книги", exact: true }).click();
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
  await page.getByRole("button", { name: /Отправить/ }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: /Твоя.*открытка/ }),
  ).toHaveValue("Тёплые слова <b>остаются текстом</b>");
  await expect(page.locator(".wish-card")).toHaveCount(24);
  await expect(page.locator(".wish-cards")).not.toContainText(
    "Тёплые слова <b>",
  );
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
  await expect(control).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "С музыкой", exact: true }).click();
  if (await page.locator("dialog.envelope-music[open]").isVisible())
    await page.getByRole("button", { name: "Без музыки", exact: true }).click();
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
    if (await page.locator("dialog.envelope-music[open]").isVisible())
      await page
        .getByRole("button", { name: "Без музыки", exact: true })
        .click();
    await page.getByRole("button", { name: /Открыть.*приглашение/ }).click();
    const hero = await page.locator(".hero").boundingBox();
    expect(hero!.height).toBeLessThanOrEqual(height + 1);
  });
test("letter comes in front of the envelope before the page transition", async ({
  page,
}) => {
  await page.goto("/");
  if (await page.locator("dialog.envelope-music[open]").isVisible())
    await page.getByRole("button", { name: "Без музыки", exact: true }).click();
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
test("hero supporting text remains visible after its initial reveal", async ({
  page,
}) => {
  await page.goto("/#/invitation?section=personal");
  await page.evaluate(() => scrollTo(0, 0));
  const subtitle = page.locator(".hero-subtitle");
  await expect(subtitle).toHaveCSS("opacity", "1");
  await expect(subtitle).toHaveCSS("opacity", "1");
  await expect(page.locator(".paint-date")).toHaveCSS("opacity", "1");
  await expect(page.locator(".hero .ink-art")).toHaveCSS("opacity", "1");
  await page.locator(".rsvp").scrollIntoViewIfNeeded();
  await expect(subtitle).toHaveCSS("opacity", "1");
  await page.evaluate(() => scrollTo(0, 0));
  await expect(subtitle).toHaveCSS("opacity", "1");
});
test("wishlist copy remains visible when approached from below", async ({
  page,
}) => {
  // The compact layout leaves a few pixels visible at the bottom of a 720px viewport.
  // Use a shorter viewport so the test actually exercises a complete leave/re-entry.
  await page.setViewportSize({ width: 1280, height: 440 });
  await page.goto("/#/invitation?section=gifts");
  const link = page.locator(".flower-copy > .word-copy").last();
  await link.scrollIntoViewIfNeeded();
  await expect(link.locator(".text-word").last()).toHaveCSS("opacity", "1");
  await page.locator(".contact").scrollIntoViewIfNeeded();
  expect(
    (await link.boundingBox())!.y + (await link.boundingBox())!.height,
  ).toBeLessThanOrEqual(0);
  await expect(link.locator(".text-word").last()).toHaveCSS("opacity", "1");
  await link.scrollIntoViewIfNeeded();
  await expect(link).toHaveAttribute("data-reveal-state", "visible");
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
  const wing = page.locator(".butterfly-layer .butterfly-left").first();
  await expect(wing).toHaveCSS("animation-name", "butterfly-flap");
  await expect(page.locator(".bouquet-drift > .living-art")).toHaveCSS(
    "animation-name",
    "gentle-art",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(wing).toHaveCSS("animation-name", "none");
  await expect(page.locator(".bouquet-drift > .living-art")).toHaveCSS(
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

test("desktop RSVP rides over the venue and reverses on upward scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
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
  const venue = page.locator(".venue");
  expect(after).toBeLessThan(before - 100);
  await expect(venue).toHaveCSS("position", "sticky");
  expect((await venue.boundingBox())!.height).toBeLessThan(
    await venue.evaluate((el) => (el as HTMLElement).offsetHeight),
  );
  await expect(page.locator(".venue-copy h2 .written-char").last()).toHaveCSS(
    "opacity",
    "1",
  );
  await page.evaluate((y) => scrollTo(0, y + 80), start);
  await expect
    .poll(async () => (await page.locator(".rsvp").boundingBox())!.y)
    .toBeCloseTo(before, 0);
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
  await expect(page.locator("#gifts")).toBeFocused();
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
  await page.goto("/#/wishlist?view=gifts");
  await page.getByRole("button", { name: "Фильтры", exact: true }).click();
  await page.locator(".gift-sort summary").click();
  await page.getByRole("button", { name: "По убыванию цены" }).click();
  await page.getByRole("slider", { name: /Бюджет от/ }).fill("5000");
  await page.mouse.wheel(0, 150);
  await expect(page.getByRole("slider", { name: /Бюджет от/ })).toHaveValue(
    "5000",
  );
  await expect(page.locator(".gift-sort summary")).toHaveText(
    "По убыванию цены",
  );
  await expect(page.locator(".gift-card")).toHaveCount(5);
  await page.getByRole("button", { name: "Сбросить", exact: true }).click();
  await expect(page.locator(".gift-card")).toHaveCount(6);
});

test("reservation dialog retains the name on failure and restores focus", async ({
  page,
}) => {
  await page.goto("/#/wishlist?view=gifts");
  const card = page.locator(".gift-card").first();
  const open = card.getByRole("button", { name: "Забронировать", exact: true });
  await open.click();
  const dialog = page.getByRole("dialog", { name: "Забронировать подарок" });
  const input = dialog.getByRole("textbox", { name: /Твоё.*имя/ });
  await expect(input).toBeFocused();
  await input.fill("Синтетический гость");
  await dialog
    .getByRole("button", { name: "Забронировать", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Не получилось отправить",
  );
  await expect(input).toHaveValue("Синтетический гость");
  await dialog.getByRole("button", { name: "Отменить", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(open).toBeFocused();
});

test("a guest can reserve and cancel a gift through the Supabase client", async ({
  page,
}) => {
  const project = "https://reservation-fixture.invalid";
  const guest = {
    id: "00000000-0000-4000-8000-000000000017",
    is_anonymous: true,
  };
  let reserved = false;
  let signIns = 0;
  await page.route("**/src/data/guestResponses.ts*", async (route) => {
    const response = await route.fetch();
    const source = (await response.text())
      .replace(
        /const url = [^;]+;/,
        "const url = " + JSON.stringify(project) + ";",
      )
      .replace(
        /const key = [^;]+;/,
        'const key = "sb_publishable_synthetic_booking";',
      );
    await route.fulfill({ response, body: source });
  });
  await page.route(project + "/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/auth/v1/signup") {
      signIns++;
      const payload = Buffer.from(
        JSON.stringify({
          sub: guest.id,
          exp: Math.floor(Date.now() / 1000) + 3600,
        }),
      ).toString("base64url");
      return route.fulfill({
        json: {
          access_token: "eyJhbGciOiJIUzI1NiJ9." + payload + ".synthetic",
          refresh_token: "synthetic-refresh",
          expires_in: 3600,
          token_type: "bearer",
          user: guest,
        },
      });
    }
    if (path.endsWith("/invitation_gift_availability"))
      return route.fulfill({
        json: [{ gift_id: 1, bookable: true, own: reserved, reserved }],
      });
    if (path.endsWith("/reserve_invitation_gift")) {
      expect(route.request().postDataJSON()).toEqual({
        requested_id: 1,
        giver: "Синтетический гость",
      });
      reserved = true;
      return route.fulfill({ json: true });
    }
    if (path.endsWith("/cancel_invitation_gift")) {
      expect(route.request().postDataJSON()).toEqual({ requested_id: 1 });
      reserved = false;
      return route.fulfill({ json: true });
    }
    await route.abort();
  });
  await page.goto("/#/wishlist?view=gifts");
  const card = page.locator(".gift-card").filter({ hasText: "Книга для" });
  await card
    .getByRole("button", { name: "Забронировать", exact: true })
    .click();
  const dialog = page.locator(".reservation-dialog");
  await dialog.getByRole("textbox").fill("  Синтетический гость  ");
  await dialog
    .getByRole("button", { name: "Забронировать", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Подарок забронирован." }),
  ).toBeVisible();
  await card.getByRole("button", { name: "Твоя бронь", exact: true }).click();
  await dialog
    .getByRole("button", { name: "Отменить бронь", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Бронь отменена." }),
  ).toBeVisible();
  expect(signIns).toBe(1);
});

for (const width of [390, 1440])
  test(`gift card size follows its content at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#/wishlist?view=gifts");
    const cards = page.locator(".gift-card");
    await expect(cards).toHaveCount(6);
    await cards
      .first()
      .locator(".gift-description")
      .evaluate((el) => {
        el.textContent = "Synthetic long description. ".repeat(35);
      });
    const heights = await cards.evaluateAll((items) =>
      items.map((el) => el.getBoundingClientRect().height),
    );
    expect(heights[0]).toBeGreaterThan(heights[2] + 24);
    if (width === 1440)
      expect(Math.abs(heights[0] - heights[1])).toBeLessThan(2);
    else expect(heights[0]).toBeGreaterThan(heights[1] + 24);
    const gap = await cards.nth(2).evaluate((el) => {
      const info = el.querySelector(".gift-info")!.getBoundingClientRect();
      const photo = el.querySelector(".gift-picture")!.getBoundingClientRect();
      const buttons = el
        .querySelector(".gift-actions")!
        .getBoundingClientRect();
      return buttons.top - Math.max(info.bottom, photo.bottom);
    });
    expect(gap).toBeLessThan(24);
  });

test("body words wait for the heading and remain visible on upward entry", async ({
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
  await expect(copy.locator(".text-word").last()).toHaveCSS("opacity", "1");
  await copy.scrollIntoViewIfNeeded();
  await expect(copy).toHaveAttribute("data-reveal-state", "visible");
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
    await page.goto(
      "/#/" + (route === "wishlist" ? "wishlist?view=gifts" : route),
    );
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
  if (await page.locator("dialog.envelope-music[open]").isVisible())
    await page.getByRole("button", { name: "Без музыки", exact: true }).click();
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

test("stacked layers shrink and personal papers stay opaque", async ({
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
  expect((await page.locator(".venue").boundingBox())!.width).toBeLessThan(
    1440,
  );
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
  const geometry = await rsvp.evaluate((el) => {
    const button = el
      .querySelector(".guest-form .button")!
      .getBoundingClientRect();
    return {
      button: button.toJSON(),
      color: getComputedStyle(el, "::before").backgroundColor,
    };
  });
  // Inspect the actual painted CSS surface, including every pixel around the button.
  // Hiding children preserves layout and the section's scalloped pseudo-element.
  const paintOnly = await page.addStyleTag({
    content: ".rsvp > * { visibility: hidden !important; }",
  });
  const pixels = (await page.screenshot()).toString("base64");
  const inside = await page.evaluate(
    async ({ pixels, geometry }) => {
      const image = new Image();
      image.src = "data:image/png;base64," + pixels;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(image, 0, 0);
      const expected = geometry.color
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map(Number);
      const r = geometry.button;
      const matches = (x: number, y: number) => {
        if (x < 0 || y < 0 || x >= image.width || y >= image.height)
          return false;
        const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
        return expected.every((value, i) => Math.abs(pixel[i] - value) <= 2);
      };
      for (let x = Math.ceil(r.left); x < r.right; x++)
        if (!matches(x, r.top) || !matches(x, r.bottom - 1)) return false;
      for (let y = Math.ceil(r.top); y < r.bottom; y++)
        if (!matches(r.left, y) || !matches(r.right - 1, y)) return false;
      return true;
    },
    { pixels, geometry },
  );
  await paintOnly.evaluate((el) => el.remove());
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

test("card opens booking directly, shows the shop and blocks reserved gifts", async ({
  page,
}) => {
  await page.route("**/src/data/content.ts*", async (route) => {
    const response = await route.fetch();
    const source = await response.text();
    await route.fulfill({
      response,
      body:
        source +
        '\ngifts[0].name="AAA synthetic";gifts[1].name="BBB synthetic";gifts[0].images=[{src:"/art/bouquet.webp",alt:"Synthetic photo"}];gifts[0].shop={name:"Synthetic shop",url:"https://example.invalid/"};gifts[0].note="Synthetic optional gift note";gifts[1].availability="reserved";',
    });
  });
  await page.goto("/#/wishlist?view=gifts");
  const reserved = page
    .locator(".gift-card")
    .filter({ hasText: "BBB synthetic" });
  await expect(
    reserved.getByRole("button", { name: "Забронировано", exact: true }),
  ).toBeDisabled();
  await expect(reserved.locator(".gift-open")).toHaveCount(0);
  const card = page.locator(".gift-card").filter({ hasText: "AAA synthetic" });
  await expect(card.getByText(/Магазин:.*Synthetic shop/)).toBeVisible();
  await expect(card.getByRole("link", { name: "В магазин" })).toHaveCSS(
    "border-top-width",
    "1px",
  );
  const open = card.locator(".gift-open");
  await open.click();
  const dialog = page.getByRole("dialog", { name: "Забронировать подарок" });
  await expect(
    dialog.getByRole("textbox", { name: /Твоё.*имя/ }),
  ).toBeFocused();
  await expect(dialog.getByAltText("Synthetic photo")).toBeVisible();
  await expect(dialog.getByText("Synthetic optional gift note")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(open).toBeFocused();
});

test("personal and contact links keep a visible curved underline", async ({
  page,
}) => {
  await page.goto("/#/invitation?section=personal");
  for (const link of [
    page.locator(".paper-link").first(),
    page.locator(".contact-link"),
  ]) {
    const line = link.locator(".hand-underline path");
    await expect(line).toHaveAttribute("d", /C.*S/);
    await expect(line).toHaveCSS("stroke-dashoffset", "0px");
    await link.hover();
    await expect(line).toHaveCSS("stroke-dashoffset", "0px");
  }
});

test("time text and its shaped badge reveal and reset as one object", async ({
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
  await expect(time).toHaveCSS("border-radius", "0px");
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
        el.querySelector<HTMLElement>(".venue")!.offsetHeight +
        parseFloat(getComputedStyle(el.querySelector(".venue")!).marginBottom);
      return (
        normal -
        parseFloat(getComputedStyle(el).getPropertyValue("--rsvp-cover-top"))
      );
    });
    await page.evaluate((y) => scrollTo(0, y), pose);
    const venue = page.locator(".venue");
    await expect(venue).toHaveCSS("transform", "none");
    expect((await venue.boundingBox())!.height).toBeLessThan(
      await venue.evaluate((el) => (el as HTMLElement).offsetHeight),
    );
    await page.waitForTimeout(1200);
    const bounds = (await venue.boundingBox())!;
    const clip = {
      x: bounds.x,
      y: Math.max(0, bounds.y),
      width: bounds.width,
      height: Math.min(900, bounds.y + bounds.height) - Math.max(0, bounds.y),
    };
    // Retry while entrance animations settle, but require every pixel to match.
    await expect
      .poll(async () => {
        const covered = await page.screenshot({ clip, animations: "disabled" });
        await venue.evaluate((el) => {
          (el as HTMLElement).style.visibility = "hidden";
        });
        const withoutVenue = await page.screenshot({
          clip,
          animations: "disabled",
        });
        await venue.evaluate((el) => {
          (el as HTMLElement).style.removeProperty("visibility");
        });
        return covered.equals(withoutVenue);
      })
      .toBe(true);
    const before = (await page.locator(".rsvp").boundingBox())!.y;
    await page.evaluate((y) => scrollTo(0, y - 220), pose);
    expect((await page.locator(".rsvp").boundingBox())!.y).toBeGreaterThan(
      before + 100,
    );
  });

for (const width of [390, 1440])
  test(`reservation modal leaves card sizes unchanged at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#/wishlist?view=gifts");
    await page.evaluate(() => document.fonts.ready);
    const cards = page.locator(".gift-card");
    await expect(cards).toHaveCount(6);
    const sizes = () =>
      cards.evaluateAll((items) =>
        items.map((item) => ({
          width: item.getBoundingClientRect().width,
          height: item.getBoundingClientRect().height,
        })),
      );
    const before = await sizes();
    const reserve = cards
      .first()
      .getByRole("button", { name: "Забронировать", exact: true });
    await reserve.click();
    const dialog = page.getByRole("dialog", { name: "Забронировать подарок" });
    await expect(
      dialog.getByRole("textbox", { name: /Твоё.*имя/ }),
    ).toBeFocused();
    expect(await sizes()).toEqual(before);
    await dialog.getByRole("button", { name: "Отменить", exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(reserve).toBeFocused();
    expect(await sizes()).toEqual(before);
  });

test("declining music on the envelope persists across navigation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Без музыки", exact: true }).click();
  await page.getByRole("button", { name: "Открыть приглашение" }).click();
  await expect(page.locator(".hero-title")).toBeVisible();
  await page.evaluate(() => {
    location.hash = "/personal";
  });
  await expect(page.locator(".atmosphere-controls button")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.locator(".atmosphere-controls button").click();
  await expect(page.locator(".atmosphere-controls button")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("an open wish feed reloads moderation changes when focus returns", async ({
  page,
}) => {
  const fixture = "https://wish-refresh-fixture.invalid";
  let text = "Before moderation";
  await page.route("**/src/data/guestResponses.ts*", async (route) => {
    const response = await route.fetch();
    const source = (await response.text())
      .replace(
        /const url = [^;]+;/,
        "const url = " + JSON.stringify(fixture) + ";",
      )
      .replace(
        /const key = [^;]+;/,
        'const key = "sb_publishable_synthetic_wish_refresh";',
      );
    await route.fulfill({ response, body: source });
  });
  await page.route(fixture + "/rest/v1/wishes?*", (route) =>
    route.fulfill({
      json: [{ id: "synthetic-wish", name: "Synthetic author", message: text }],
    }),
  );
  await page.goto("/#/memories");
  await expect(page.getByText("Before moderation")).toBeVisible();
  text = "After moderation";
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByText("After moderation")).toBeVisible();
  await expect(page.getByText("Before moderation")).toHaveCount(0);
});

for (const width of [390, 1440])
  test(`wish icons, growing fields and own deletion at ${width}px`, async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await installModerationPreview(context);
    await page.goto("/#/memories");
    const own = page.locator(".wish-card").filter({ hasText: "Тестовая Аня" });
    const other = page
      .locator(".wish-card")
      .filter({ hasText: "Тестовый Миша" });
    await expect(other.getByRole("button")).toHaveCount(0);
    await own.getByRole("button", { name: "Изменить пожелание" }).click();
    const dialog = page.getByRole("dialog", { name: "Изменить пожелание" });
    const field = dialog.getByRole("textbox", { name: "Твоя открытка" });
    await expect(field).toHaveValue("Ура!");
    const short = (await field.boundingBox())!.height;
    await field.fill(
      "Первая строка\nВторая строка\nТретья строка\nЧетвёртая строка",
    );
    expect((await field.boundingBox())!.height).toBeGreaterThan(short + 20);
    await dialog.getByRole("button", { name: "Сохранить" }).click();
    await expect(own).toContainText("Первая строка");
    const deleteButton = own.getByRole("button", { name: "Удалить пожелание" });
    await deleteButton.click();
    const confirmation = page.getByRole("dialog", {
      name: "Удалить пожелание?",
    });
    await confirmation.getByRole("button", { name: "Отмена" }).click();
    await expect(own).toBeVisible();
    await deleteButton.click();
    await confirmation
      .getByRole("button", { name: "Удалить", exact: true })
      .click();
    await expect(own).toHaveCount(0);
    await expect(other).toBeVisible();
  });

test("booked-only filter includes own and other guest reservations", async ({
  page,
  context,
}) => {
  await installModerationPreview(context);
  await page.goto("/#/wishlist?view=gifts");
  await expect(page.locator(".gift-card")).toHaveCount(6);
  const filter = page.getByRole("button", {
    name: "Забронированные",
    exact: true,
  });
  await filter.click();
  await expect(page.locator(".gift-card")).toHaveCount(2);
  await expect(
    page.getByRole("button", { name: "Твоя бронь", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Забронировано", exact: true }),
  ).toBeDisabled();
  await filter.click();
  await expect(page.locator(".gift-card")).toHaveCount(6);
});

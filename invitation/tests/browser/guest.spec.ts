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
test("reduced motion exposes content without animation and retains silent audio", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/personal");
  await expect(
    page.getByRole("heading", { name: /Это.*всё.*я/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Включить.*музыку/ }),
  ).toHaveAttribute("aria-pressed", "false");
  const hidden = await page
    .locator(".written-char")
    .evaluateAll((chars) =>
      chars.some((el) => getComputedStyle(el).opacity === "0"),
    );
  expect(hidden).toBe(false);
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

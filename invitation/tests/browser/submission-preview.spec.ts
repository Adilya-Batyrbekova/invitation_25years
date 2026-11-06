import { test, expect } from "@playwright/test";

for (const wish of [false, true]) {
  test(`preview flight preserves inputs without publishing: ${wish ? "wish" : "attendance"}`, async ({
    page,
  }) => {
    await page.goto(wish ? "/#/memories" : "/#/invitation?section=gifts");
    const form = page.locator(".guest-form");
    await form.locator('input[name="name"]').fill("Тестовый гость");
    if (wish)
      await form
        .locator("textarea")
        .fill("Тестовая открытка для просмотра анимации");
    else await form.locator('input[value="yes"]').check();
    const cardsBefore = await page.locator(".wish-card").count();
    await form.getByRole("checkbox").check();
    await form.getByRole("button", { name: "Отправить", exact: true }).click();
    await expect(form.locator(".send-flight")).toBeVisible();
    await expect(form.locator("button[type=submit]")).toBeDisabled();
    await expect(form.getByRole("status")).toContainText(
      /Данные.*не.*сохранялись/,
    );
    await expect(form.locator(".send-flight")).toHaveCount(0);
    await expect(form.locator('input[name="name"]')).toHaveValue(
      "Тестовый гость",
    );
    if (wish)
      await expect(form.locator("textarea")).toHaveValue(
        "Тестовая открытка для просмотра анимации",
      );
    else await expect(form.locator('input[value="yes"]')).toBeChecked();
    expect(await page.locator(".wish-card").count()).toBe(cardsBefore);
    await expect(form.getByRole("alert")).toHaveCount(0);
  });
}

import { test, expect } from "@playwright/test";
for (const width of [390, 1440]) {
  test(
    "Pages build assets and four routes at " + width,
    async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      const failures: string[] = [];
      page.on("pageerror", (error) => failures.push(error.message));
      page.on("response", (response) => {
        if (response.status() >= 400)
          failures.push(response.url() + ": " + response.status());
      });
      await page.goto("./");
      await page.getByRole("button", { name: /Открыть.*приглашение/ }).click();
      await expect(
        page.getByRole("heading", { name: "Мне 25!" }),
      ).toBeVisible();
      const base = new URL(page.url()).pathname;
      expect(base).toBe("/invitation_25years/");
      for (const [route, heading] of [
        ["personal", "Это всё я"],
        ["memories", "На память"],
        ["wishlist", "Вишлист"],
      ]) {
        await page.goto("./#/" + route);
        await expect(
          page.getByRole("heading", { name: heading, exact: true }),
        ).toBeVisible();
        await page.reload();
        await expect(
          page.getByRole("heading", { name: heading, exact: true }),
        ).toBeVisible();
      }
      await expect(page.locator(".gift-card")).toHaveCount(6);
      await page
        .getByRole("link", { name: "Приглашение", exact: true })
        .click();
      await expect(page).toHaveURL(
        /invitation_25years\/#\/invitation\?section=gifts/,
      );
      await expect(page.locator("#gifts")).toBeFocused();
      const images = await page
        .locator("img")
        .evaluateAll((nodes) => nodes.map((node) => node.src));
      expect(images.length).toBeGreaterThan(0);
      for (const src of images) {
        expect(new URL(src).pathname.startsWith(base)).toBe(true);
        expect((await page.request.get(src)).status()).toBe(200);
      }
      const background = await page
        .locator(".butterfly-wing")
        .first()
        .evaluate((node) => getComputedStyle(node).backgroundImage);
      expect(background).toContain(
        "/invitation_25years/art/painted-butterfly.png",
      );
      const license = await page.request.get(
        new URL("licenses/Typograf-MIT.txt", page.url()).href,
      );
      expect(license.status()).toBe(200);
      expect(await license.text()).toContain("MIT");
      await page.screenshot({
        path: testInfo.outputPath("pages.png"),
        fullPage: false,
      });
      expect(failures).toEqual([]);
    },
  );
}

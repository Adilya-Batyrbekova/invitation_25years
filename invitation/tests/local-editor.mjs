import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";

const source = fileURLToPath(new URL("../", import.meta.url));
const workspace = await mkdtemp(join(tmpdir(), "invitation-editor-test-"));
for (const name of [
  "src",
  "scripts",
  "index.html",
  "package.json",
  "vite.config.ts",
]) {
  await cp(join(source, name), join(workspace, name), { recursive: true });
}
await mkdir(join(workspace, "public"));
await cp(join(source, "public", "art"), join(workspace, "public", "art"), {
  recursive: true,
});
await symlink(
  join(source, "node_modules"),
  join(workspace, "node_modules"),
  "junction",
);
const env = { ...process.env };
for (const key of Object.keys(env)) {
  if (key.startsWith("VITE_SUPABASE_")) delete env[key];
}
env.VITE_SUPABASE_URL = "https://supabase-editor-test.invalid";
env.VITE_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_synthetic_editor_test";
const server = spawn(
  process.execPath,
  [
    join(workspace, "node_modules", "vite", "bin", "vite.js"),
    "--host",
    "127.0.0.1",
    "--port",
    "0",
  ],
  { cwd: workspace, env, stdio: ["ignore", "pipe", "inherit"] },
);
let browser;
try {
  const origin = await new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Vite did not start")),
      20000,
    );
    server.stdout.on("data", (chunk) => {
      const found = /http:\/\/127\.0\.0\.1:\d+/.exec(chunk.toString());
      if (found) {
        clearTimeout(timeout);
        resolve(found[0]);
      }
    });
    server.on("exit", () => {
      clearTimeout(timeout);
      reject(new Error("Vite exited"));
    });
  });
  browser = await chromium.launch(
    process.platform === "win32" ? { channel: "msedge" } : {},
  );
  const page = await browser.newPage();
  await page.route(
    env.VITE_SUPABASE_URL + "/rest/v1/invitation_content?*",
    (route) => route.fulfill({ json: [] }),
  );
  const rejected = await fetch(origin + "/__invitation-editor", {
    headers: { Origin: "https://example.invalid", "X-Invitation-Editor": "1" },
  });
  assert.equal(rejected.status, 403);
  await page.goto(origin + "/owner");
  await page
    .getByRole("button", { name: "Это всё я", exact: true })
    .first()
    .click();
  await page.getByLabel("Вступление").fill("Synthetic personal introduction");
  await page.locator(".owner-record summary").first().click();
  const sourceImage = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1800;
    canvas.height = 1300;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 900, 1300);
    ctx.fillStyle = "blue";
    ctx.fillRect(900, 0, 900, 1300);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles({
      name: "synthetic.png",
      mimeType: "image/png",
      buffer: Buffer.from(sourceImage, "base64"),
    });
  await expect(
    page.getByRole("img", { name: "Предпросмотр кадра" }),
  ).toHaveAttribute("width", "1200");
  const crop = page.getByRole("img", { name: "Предпросмотр кадра" });
  const pixel = () =>
    crop.evaluate((canvas) => [
      ...canvas.getContext("2d").getImageData(500, 600, 1, 1).data,
    ]);
  await expect.poll(pixel).toEqual([255, 0, 0, 255]);
  await page.getByLabel("Положение по горизонтали").press("End");
  await expect.poll(pixel).toEqual([0, 0, 255, 255]);
  await page.getByRole("button", { name: "Применить кадр" }).click();
  await expect(
    page.getByRole("img", { name: "Предпросмотр кадра" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Сохранить черновик" })
    .first()
    .click();
  await expect(
    page.getByText("Черновик сохранён на компьютере."),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Это всё я", exact: true })
    .first()
    .click();
  await expect(page.getByLabel("Вступление")).toHaveValue(
    "Synthetic personal introduction",
  );
  await page.goto(origin + "/?draft=1#/personal");
  await expect(page.locator("main")).toContainText(
    "Synthetic personal introduction",
  );

  await page.goto(origin + "/owner");
  await page
    .getByRole("button", { name: "Что мне нравится", exact: true })
    .first()
    .click();
  const topic = page.locator(".owner-records-grid > .owner-record").filter({
    has: page.locator("summary").filter({ hasText: "Книжная полка" }),
  });
  const topics = page.locator(".owner-topics > .owner-record");
  const grip = topic.getByRole("button", {
    name: "Переместить карточку Книжная полка",
  });
  const gripBox = await grip.boundingBox();
  const firstSummary = await topics
    .first()
    .locator(":scope > summary")
    .boundingBox();
  await page.mouse.move(
    gripBox.x + gripBox.width / 2,
    gripBox.y + gripBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(firstSummary.x + 25, firstSummary.y + 15, { steps: 8 });
  await page.mouse.up();
  await expect(topics.first().locator(":scope > summary")).toContainText(
    "Книжная полка",
  );
  await grip.focus();
  await grip.press("ArrowDown");
  await expect(topics.nth(1).locator(":scope > summary")).toContainText(
    "Книжная полка",
  );
  await topics.first().locator(":scope > summary").click();
  await topic.locator(":scope > summary").click();
  await expect(topics.first()).toHaveAttribute("open", "");
  await expect(topic).toHaveAttribute("open", "");
  const book = topic.locator(".owner-record").first();
  await book.locator(":scope > summary").click();
  await book.locator('input[type="file"]').setInputFiles({
    name: "synthetic-book.png",
    mimeType: "image/png",
    buffer: Buffer.from(sourceImage, "base64"),
  });
  const square = page.getByRole("checkbox", { name: "Квадратный кадр" });
  await expect(square).toBeVisible();
  assert.ok((await square.boundingBox()).width <= 20);
  const preview = page.getByRole("img", { name: "Предпросмотр кадра" });
  assert.ok((await square.boundingBox()).x > (await preview.boundingBox()).x);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(square).toBeVisible();
  assert.ok((await square.boundingBox()).y > (await preview.boundingBox()).y);
  await square.check();
  await page.getByRole("button", { name: "Применить кадр" }).click();
  await expect(book.getByRole("img", { name: "Фото 1" })).toBeVisible();
  const copy = book.getByRole("textbox", { name: "Текст", exact: true });
  const initialHeight = (await copy.boundingBox()).height;
  assert.ok(initialHeight >= 120);
  await copy.fill("Длинное описание\n".repeat(16));
  assert.ok((await copy.boundingBox()).height > initialHeight);
  await expect(book.getByRole("button", { name: "Жирный" })).toHaveCount(0);
  await copy.fill("Первая строка");
  await copy.press("Shift+Enter");
  await copy.press("End");
  await page.keyboard.insertText("Вторая строка");
  await copy.press("Enter");
  await page.keyboard.insertText(
    "**Чашка**\n*Для чая*\n\n- Посуда\n- <svg onload=alert(1)>",
  );
  await expect(copy).toHaveValue(
    "Первая строка\nВторая строка\n\n**Чашка**\n*Для чая*\n\n- Посуда\n- <svg onload=alert(1)>",
  );
  await book.getByText("Предпросмотр текста", { exact: true }).click();
  const formattedPreview = book.locator(".formatted-text");
  await expect(formattedPreview.locator("strong")).toHaveText("Чашка");
  await expect(formattedPreview.locator("em")).toHaveText("Для чая");
  await expect(formattedPreview.locator("li")).toHaveCount(2);
  await page.getByRole("button", { name: "Добавить карточку" }).click();
  const added = page.locator(".owner-records-grid > .owner-record").last();
  await added.getByLabel("Заголовок карточки").fill("Новая тема");
  await added.getByLabel("Описание карточки").fill("Описание новой темы");
  await added.locator('input[type="file"]').setInputFiles({
    name: "synthetic-topic.png",
    mimeType: "image/png",
    buffer: Buffer.from(sourceImage, "base64"),
  });
  await added.getByRole("button", { name: "Применить кадр" }).click();
  await expect(added.getByRole("img", { name: "Фото 1" })).toBeVisible();
  await added
    .getByRole("button", { name: "Добавить раскрывающийся пункт" })
    .click();
  const newItem = added.locator(".owner-record");
  await newItem.getByLabel("Заголовок", { exact: true }).fill("Подсказка");
  await newItem
    .getByRole("textbox", { name: "Текст", exact: true })
    .fill("Текст подсказки");
  await added
    .getByRole("checkbox", { name: "Галерея после раскрывающихся пунктов" })
    .check();
  const newCard = page.locator(".owner-records-grid > .owner-record").filter({
    has: page.getByText("Новая тема", { exact: true }),
  });
  for (let i = 0; i < 3; i++) {
    await newCard
      .locator(":scope > .owner-record-fields > .owner-order")
      .getByRole("button", { name: "Выше" })
      .click();
  }
  await page
    .getByRole("button", { name: "Сохранить черновик" })
    .first()
    .click();
  await expect(
    page.getByText("Черновик сохранён на компьютере."),
  ).toBeVisible();
  await page.goto(origin + "/?draft=1#/wishlist");
  await page
    .getByRole("button", { name: "Что мне нравится", exact: true })
    .click();
  const cards = page.locator(".gift-ideas > article");
  await expect(cards.locator("h2")).toHaveText([
    "Новая тема",
    "Интерьер с характером",
    "Книжная полка",
    "Коллекция кружек",
  ]);
  await expect(cards.nth(1).locator(".photo-deck")).toBeVisible();
  await cards.first().getByText("Подсказка", { exact: true }).click();
  await expect(cards.first().getByText("Текст подсказки")).toBeVisible();
  await cards
    .first()
    .getByRole("button", { name: "Увеличить иллюстрацию 1" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Иллюстрация крупным планом" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Иллюстрация крупным планом" }),
  ).toHaveCount(0);
  await page.locator("summary").filter({ hasText: "Книги и авторы" }).click();
  const formattedGuest = page.locator(
    ".gift-ideas article:nth-child(3) details[open] .formatted-text",
  );
  await expect(formattedGuest.locator("p")).toHaveCount(2);
  await expect(formattedGuest.locator("p").first().locator("br")).toHaveCount(
    1,
  );
  await expect(formattedGuest.locator("strong")).toHaveText("Чашка");
  await expect(formattedGuest.locator("em")).toHaveText("Для чая");
  await expect(formattedGuest.locator("li")).toHaveCount(2);
  await expect(formattedGuest.locator("svg")).toHaveCount(0);
  await expect(formattedGuest).toContainText("<svg onload=alert(1)>");
  await expect(
    page
      .getByRole("group", { name: "Фотографии: Книги и авторы" })
      .locator("img"),
  ).toBeVisible();

  const draft = JSON.parse(
    await readFile(join(workspace, ".local-content", "draft.json"), "utf8"),
  );
  const photo = draft.personal.stories[0].photos.at(-1);
  assert.match(photo, /^editor-images\/[0-9a-f-]{36}\.png$/);
  const bytes = await readFile(
    join(workspace, ".local-content", "images", photo.split("/").at(-1)),
  );
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(bytes.readUInt32BE(16), 1200);
  assert.equal(bytes.readUInt32BE(20), 1200);

  execFileSync(
    process.execPath,
    ["scripts/prepare-content.mjs", "--ideas-only"],
    {
      cwd: workspace,
      env,
    },
  );
  const publishedIdeas = JSON.parse(
    await readFile(join(workspace, "public", "invitation-ideas.json"), "utf8"),
  );
  assert.match(
    publishedIdeas.cards.find((card) => card.id === "books").items[0].photos[0],
    /^editor-images\/[0-9a-f]{64}\.png$/,
  );
  assert.equal(publishedIdeas.personal, undefined);
  const bookItem = publishedIdeas.cards.find((card) => card.id === "books")
    .items[0];
  assert.match(bookItem.value, /\*\*Чашка\*\*/);
  assert.match(
    publishedIdeas.cards[0].photos[0],
    /^editor-images\/[0-9a-f]{64}\.png$/,
  );
  assert.equal(publishedIdeas.cards[0].galleryAfterItems, true);
  assert.equal(publishedIdeas.gifts, undefined);
  await assert.rejects(
    readFile(join(workspace, ".local-content", "gift-registry.sql")),
    { code: "ENOENT" },
  );

  execFileSync(process.execPath, ["scripts/prepare-content.mjs"], {
    cwd: workspace,
    env,
  });
  const published = JSON.parse(
    await readFile(
      join(workspace, "public", "invitation-content.json"),
      "utf8",
    ),
  );
  const preparedPhoto = published.personal.stories[0].photos.at(-1);
  assert.match(preparedPhoto, /^editor-images\/[0-9a-f]{64}\.png$/);
  assert.deepEqual(
    await readFile(join(workspace, "public", preparedPhoto)),
    bytes,
  );
  const registry = await readFile(
    join(workspace, ".local-content", "gift-registry.sql"),
    "utf8",
  );
  assert.match(registry, /on conflict \(gift_id\) do update/);
  for (const [section, label, records, position] of [
    ["personal", "Это всё я", "stories", "История"],
    ["gifts", "Вишлист", "items", "Подарок"],
  ]) {
    await page.goto(origin + "/owner");
    await page
      .getByRole("button", { name: label, exact: true })
      .first()
      .click();
    const cards = page.locator(".owner-topics > .owner-record");
    const titles = cards.locator(":scope > summary .owner-topic-title > span");
    await expect(cards.first().locator(":scope > summary small")).toHaveText(
      position + " 1",
    );
    const [first, second] = await titles.allTextContents();
    await cards
      .first()
      .getByRole("button", { name: /Переместить карточку/ })
      .press("ArrowDown");
    await expect(titles.first()).toHaveText(second);
    await expect(titles.nth(1)).toHaveText(first);
    await page
      .getByRole("button", { name: "Сохранить черновик" })
      .first()
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: /сохранён/ }),
    ).toBeVisible();
    const reordered = JSON.parse(
      await readFile(join(workspace, ".local-content", "draft.json"), "utf8"),
    );
    const key = section === "personal" ? "title" : "name";
    assert.deepEqual(
      reordered[section][records].slice(0, 2).map((item) => item[key]),
      [second, first].map((title) => title.replaceAll("\u00a0", " ")),
    );
    assert.deepEqual(
      reordered[section][records].slice(0, 2).map((item) => item.id),
      [published[section][records][1].id, published[section][records][0].id],
    );
  }

  let submitted;
  await page.route("**/__invitation-editor/publish*", async (route) => {
    await route.fulfill({
      json: { enabled: true, state: submitted && "live" },
    });
  });
  await page.route("**/__invitation-editor?section=ideas", async (route) => {
    submitted = route.request().postDataJSON().ideas;
    await route.fulfill({ json: { state: "publishing" } });
  });
  await page.goto(origin + "/owner");
  await page
    .getByRole("button", { name: "Что мне нравится", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Сохранить и опубликовать" })
    .first()
    .click();
  await expect(
    page.getByText("Черновик сохранён. Публикуем на GitHub Pages…"),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Открыть публичный сайт" }),
  ).toBeVisible();
  assert.equal(
    submitted.cards.find((card) => card.id === "books").items[0].value,
    bookItem.value,
  );
  let publishedGifts;
  let rejectGiftPublication = true;
  await page.route(env.VITE_SUPABASE_URL + "/rest/v1/rpc/*", async (route) => {
    const name = new URL(route.request().url()).pathname.split("/").at(-1);
    if (name === "can_edit_invitation") return route.fulfill({ json: true });
    assert.equal(name, "publish_invitation_gifts");
    const { catalogue } = route.request().postDataJSON();
    if (rejectGiftPublication)
      return route.fulfill({
        status: 500,
        json: { message: "Synthetic failure" },
      });
    publishedGifts = catalogue;
    return route.fulfill({ status: 204 });
  });
  await page.evaluate(() => {
    const expires = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem(
      "invitation-owner",
      JSON.stringify({
        access_token: "synthetic-owner-access",
        refresh_token: "synthetic-owner-refresh",
        expires_at: expires,
        user: {
          id: "00000000-0000-4000-8000-000000000061",
          is_anonymous: false,
        },
      }),
    );
  });
  await page.goto(origin + "/owner");
  await page
    .getByRole("button", { name: "Вишлист", exact: true })
    .first()
    .click();
  await page.getByLabel("Вступление").fill("Synthetic gift publication");
  const publishGiftsButton = page
    .getByRole("button", {
      name: "Сохранить и опубликовать",
    })
    .first();
  await publishGiftsButton.click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: /Опубликовать\s+вишлист\s+не\s+удалось/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Открыть публичный сайт" }),
  ).toHaveCount(0);
  const savedGifts = JSON.parse(
    await readFile(join(workspace, ".local-content", "draft.json"), "utf8"),
  ).gifts;
  assert.equal(savedGifts.intro, "Synthetic gift publication");
  rejectGiftPublication = false;
  await publishGiftsButton.click();
  await expect(
    page.getByRole("link", { name: "Открыть публичный сайт" }),
  ).toHaveAttribute("href", /#\/wishlist$/);
  assert.equal(publishedGifts.intro, savedGifts.intro);
  assert.deepEqual(
    publishedGifts.items.map(({ id }) => id),
    savedGifts.items.map(({ id }) => id),
  );

  console.log(
    "Passed isolated editor crop, save, reload, preview and release preparation.",
  );
} finally {
  await browser?.close();
  server.kill();
}

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
  console.log(
    "Passed isolated editor crop, save, reload, preview and release preparation.",
  );
} finally {
  await browser?.close();
  server.kill();
}

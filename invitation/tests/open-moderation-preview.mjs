import { spawn } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";
import { chromium } from "@playwright/test";
import { installModerationPreview } from "./fixtures/moderation-preview.mjs";

const origin = "http://127.0.0.1:5186";
const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "--host",
    "127.0.0.1",
    "--port",
    "5186",
    "--strictPort",
  ],
  {
    cwd: new URL("../", import.meta.url),
    env: {
      ...process.env,
      VITE_SUPABASE_URL: "",
      VITE_SUPABASE_PUBLISHABLE_KEY: "",
    },
    stdio: "ignore",
    windowsHide: true,
  },
);
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 30 && server.exitCode === null; attempt++) {
    if ((await fetch(origin).catch(() => undefined))?.ok) {
      ready = true;
      break;
    }
    await wait(400);
  }
  if (!ready || server.exitCode !== null)
    throw new Error("Fixture server could not start");
  browser = await chromium.launch({
    headless: false,
    ...(process.platform === "win32" && { channel: "msedge" }),
  });
  const context = await browser.newContext();
  await installModerationPreview(context);
  const gifts = await context.newPage();
  await gifts.goto(origin + "/#/wishlist?view=gifts");
  const wishes = await context.newPage();
  await wishes.goto(origin + "/#/memories");
  if (browser.isConnected())
    await new Promise((resolve) => browser.once("disconnected", resolve));
} finally {
  await browser?.close();
  server.kill();
}

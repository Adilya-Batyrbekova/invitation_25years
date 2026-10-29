import { spawnSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, delimiter } from "node:path";
process.chdir(fileURLToPath(new URL("..", import.meta.url)));
process.env.PATH = dirname(process.execPath) + delimiter + process.env.PATH;
const commands = {
  format: [
    "node_modules/prettier/bin/prettier.cjs",
    "--write",
    "src",
    "tests",
    "scripts",
    "*.json",
    "*.ts",
    "*.js",
    "index.html",
  ],
  "format:check": [
    "node_modules/prettier/bin/prettier.cjs",
    "--check",
    "src",
    "tests",
    "scripts",
    "*.json",
    "*.ts",
    "*.js",
    "index.html",
  ],
  lint: ["node_modules/eslint/bin/eslint.js", "src"],
  typecheck: ["node_modules/typescript/bin/tsc", "--noEmit"],
  test: ["node_modules/vitest/vitest.mjs", "run"],
  pages: [
    "node_modules/@playwright/test/cli.js",
    "test",
    "--config",
    "playwright.pages.config.ts",
  ],
  "build:pages": [
    "node_modules/vite/bin/vite.js",
    "build",
    "--base=/invitation_25years/",
  ],
  browser: ["node_modules/@playwright/test/cli.js", "test"],
  build: ["node_modules/vite/bin/vite.js", "build"],
  dev: ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1"],
};
const task = process.argv[2];
if (task === "dev") {
  const child = spawn(process.execPath, commands.dev, { stdio: "inherit" });
  child.on("exit", (code) => process.exit(code ?? 1));
} else {
  const tasks =
    task === "check"
      ? ["format:check", "lint", "typecheck", "test", "build"]
      : [task];
  for (const name of tasks) {
    if (!commands[name]) throw Error("Unknown task");
    const result = spawnSync(process.execPath, commands[name], {
      stdio: "inherit",
    });
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}

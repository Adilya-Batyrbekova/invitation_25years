import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const endpoint = "https://dukdjygqsnjlsdiaqyir.supabase.co/functions/v1/owner-bot";
const origin = "http://127.0.0.1:5183";

export async function connectTelegram(token, secret, request = fetch) {
  if (!/^\d{5,20}:[\w-]{20,100}$/.test(token) || !/^[a-f0-9]{64}$/.test(secret)) {
    throw new Error("Проверь токен бота и код подключения.");
  }
  const probe = (headers = {}) => request(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: "{}",
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
  if ((await probe()).status !== 401) {
    throw new Error("Функция должна отклонять запрос без кода подключения.");
  }
  if ((await probe({ "X-Telegram-Bot-Api-Secret-Token": secret })).status !== 204) {
    throw new Error("Проверь сохранение TELEGRAM_WEBHOOK_SECRET и настройку Verify JWT у owner-bot.");
  }

  async function telegram(method, body) {
    const response = await request("https://api.telegram.org/bot" + token + "/" + method, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error("Telegram отклонил запрос. Проверь новый токен.");
    return result.result;
  }
  const existing = await telegram("getWebhookInfo", {});
  if (existing.url && existing.url !== endpoint) {
    throw new Error("У бота уже есть другое подключение. Оно сохранено.");
  }
  if (await telegram("setWebhook", {
    url: endpoint,
    secret_token: secret,
    allowed_updates: ["message"],
  }) !== true) throw new Error("Telegram не подтвердил подключение.");
  if ((await telegram("getWebhookInfo", {})).url !== endpoint) {
    throw new Error("Не удалось подтвердить адрес подключения в Telegram.");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const require = createRequire(new URL("../invitation/package.json", import.meta.url));
  const ts = require("typescript");
  const formatter = ts.transpileModule(
    readFileSync(new URL("../invitation/src/lib/typography.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } },
  ).outputText;
  const exports = {};
  new Function("exports", "require", formatter)(exports, require);
  const t = exports.t;
  const secret = randomBytes(32).toString("hex");
  const page = (message = "") => `<!doctype html>
<html lang="ru"><meta charset="utf-8"><title>${t("Подключить Telegram")}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{max-width:38rem;margin:3rem auto;padding:0 1rem;font:1rem/1.55 system-ui;color:#39284f;background:#fff9ed}
input,button{font:inherit;padding:.55rem}input{box-sizing:border-box;width:100%;margin:.4rem 0 1rem}button{cursor:pointer}
</style>
<h1>${t("Подключение Telegram")}</h1>
<p role="status">${t(message)}</p>
<label>${t("Скопируй этот код в секрет TELEGRAM_WEBHOOK_SECRET в Supabase")}
<input readonly value="${secret}"></label>
<p>${t("Сохрани секрет, затем выключи Verify JWT только у функции owner-bot.")}</p>
<form method="post" action="/connect">
<label>${t("Новый токен бота из BotFather")}
<input type="password" name="token" autocomplete="off" required maxlength="120"></label>
<button>${t("Подключить бота")}</button>
</form></html>`;
  const messages = new Set([
    "Проверь токен бота и код подключения.",
    "Функция должна отклонять запрос без кода подключения.",
    "Проверь сохранение TELEGRAM_WEBHOOK_SECRET и настройку Verify JWT у owner-bot.",
    "Telegram отклонил запрос. Проверь новый токен.",
    "У бота уже есть другое подключение. Оно сохранено.",
    "Telegram не подтвердил подключение.",
    "Не удалось подтвердить адрес подключения в Telegram.",
  ]);
  let busy = false;
  const server = createServer(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'");
    if (req.headers.host !== "127.0.0.1:5183") {
      res.writeHead(403).end();
      return;
    }
    if (req.method === "GET" && req.url === "/") {
      res.end(page());
      return;
    }
    if (req.method !== "POST" || req.url !== "/connect" || req.headers.origin !== origin || busy) {
      res.writeHead(403).end();
      return;
    }
    busy = true;
    try {
      let body = "";
      for await (const chunk of req) {
        body += chunk.toString();
        if (body.length > 512) throw new Error();
      }
      await connectTelegram(new URLSearchParams(body).get("token")?.trim() ?? "", secret);
      res.end(page("Подключение подтверждено. Напиши боту /start в личном чате."));
    } catch (error) {
      res.end(page(messages.has(error.message) ? error.message : "Не удалось подключиться. Проверь сеть и повтори попытку."));
    } finally {
      busy = false;
    }
  });
  server.listen(5183, "127.0.0.1", () => console.log(origin));
}

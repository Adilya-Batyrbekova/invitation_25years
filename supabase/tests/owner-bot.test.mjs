import assert from "node:assert/strict";
import test from "node:test";
import { createOwnerBot } from "../functions/owner-bot/handler.mjs";

const settings = {
  secret: "synthetic-webhook",
  ownerId: "123",
  supabaseUrl: "https://example.invalid",
  serviceKey: "synthetic-service-key",
  format: (value) => value.trim(),
};

function update(id, type, text, secret = settings.secret) {
  return new Request("https://example.invalid/owner-bot", {
    method: "POST",
    headers: { "X-Telegram-Bot-Api-Secret-Token": secret },
    body: JSON.stringify({ message: { from: { id }, chat: { id, type }, text } }),
  });
}

test("unauthorized webhook, guest and group never read private records", async () => {
  const bot = createOwnerBot({ ...settings, request: () => assert.fail("Unexpected network request") });
  assert.equal((await bot(update(123, "private", "/guests", "invalid"))).status, 401);
  assert.equal((await bot(update(456, "private", "/guests"))).status, 204);
  assert.equal((await bot(update(123, "group", "/bookings"))).status, 204);
});

test("owner receives a paginated report only in their private chat", async () => {
  const calls = [];
  const bot = createOwnerBot({
    ...settings,
    request: async (url, options) => {
      calls.push([url, JSON.parse(options.body)]);
      return Response.json({ rows: [{ name: "Саша & <b>", message: "С днём рождения!\n\n<i>Тест</i>" }, { name: "Next guest" }] });
    },
  });
  const response = await bot(update(123, "private", "/wishes 2"));
  assert.equal(response.status, 200);
  const reply = await response.json();
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0][1], { report_kind: "wishes", report_page: 2 });
  assert.equal(reply.method, "sendMessage");
  assert.equal(reply.chat_id, 123);
  assert.equal(reply.protect_content, true);
  assert.equal(reply.parse_mode, "HTML");
  assert.match(reply.text, /<b>Пожелания<\/b>\n\n<b>Саша &amp; &lt;b&gt;<\/b>\nС днём рождения!\n\n&lt;i&gt;Тест&lt;\/i&gt;/);
  assert.match(reply.text, /\/wishes 3/);
  assert.doesNotMatch(reply.text, /страница/);
  assert.doesNotMatch(reply.text, /Next guest/);
});

test("attendance totals and rows stay separate with no continuation on the last page", async () => {
  const bot = createOwnerBot({
    ...settings,
    request: async () => Response.json({
      yes: 1,
      no: 1,
      rows: [{ name: "Саша", attending: true }, { name: "Миша", attending: false }],
    }),
  });
  const reply = await (await bot(update(123, "private", "/guests"))).json();
  assert.equal(reply.text, "📋 <b>Ответы гостей</b>\n\n✅ Придут — <b>1</b>\n✖️ Не придут — <b>1</b>\n\n<b>Саша</b> — приду\n<b>Миша</b> — не приду");
});

test("start replies directly even when database credentials are absent", async () => {
  const bot = createOwnerBot({
    ...settings,
    supabaseUrl: undefined,
    serviceKey: undefined,
    request: () => assert.fail("Start attempted an outbound request"),
  });
  const response = await bot(update(123, "private", "/start"));
  assert.equal(response.status, 200);
  const reply = await response.json();
  assert.equal(reply.method, "sendMessage");
  assert.equal(reply.chat_id, 123);
  assert.match(reply.text, /<b>Моё приглашение<\/b>/);
  assert.match(reply.text, /\/guests[^\n]+\n[^\n]+\/wishes[^\n]+\n[^\n]+\/bookings/);
});

test("a failed read produces no successful Telegram response", async () => {
  let calls = 0;
  const bot = createOwnerBot({
    ...settings,
    request: async () => {
      assert.equal(++calls, 1);
      return new Response(null, { status: 503 });
    },
  });
  assert.equal((await bot(update(123, "private", "/bookings"))).status, 502);
});

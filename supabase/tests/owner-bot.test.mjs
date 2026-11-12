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

const wishId = "00000000-0000-4000-8000-000000000001";
const reservationId = "00000000-0000-4000-8000-000000000002";

test("owner finds editing and cancellation commands beside the matching records", async () => {
  const bot = createOwnerBot({
    ...settings,
    request: async (_url, options) => {
      const { report_kind } = JSON.parse(options.body);
      return Response.json({ rows: report_kind === "wishes"
        ? [{ id: wishId, name: "Synthetic guest", message: "Synthetic wish" }]
        : [{ reservation_id: reservationId, gift_id: "100", gift_name: "Synthetic gift", price_kzt: 1000 }] });
    },
  });
  const wishes = await (await bot(update(123, "private", "/wishes"))).json();
  assert.ok(wishes.text.includes("<code>/editwish " + wishId + "</code>"));
  assert.ok(wishes.text.includes("<code>/deletewish " + wishId + "</code>"));
  const bookings = await (await bot(update(123, "private", "/bookings"))).json();
  assert.ok(bookings.text.includes("<code>/cancelbooking " + reservationId + "</code>"));
});

test("management rejects other users and requires confirmation for removal", async () => {
  const bot = createOwnerBot({ ...settings, request: () => assert.fail("Unexpected mutation") });
  assert.equal((await bot(update(456, "private", "/deletewish " + wishId + " confirm"))).status, 204);
  assert.equal((await bot(update(123, "group", "/cancelbooking " + reservationId + " confirm"))).status, 204);
  assert.equal((await bot(update(123, "private", "/deletewish " + wishId + " confirm", "invalid"))).status, 401);
  for (const command of ["/deletewish " + wishId, "/cancelbooking " + reservationId]) {
    const reply = await (await bot(update(123, "private", command))).json();
    assert.ok(reply.text.includes("<code>" + command + " confirm</code>"));
  }
  const invalid = await (await bot(update(123, "private", "/editwish " + wishId + " " + "x".repeat(1501)))).json();
  assert.match(invalid.text, /1500/);
});

test("only a successful mutation produces success and stale bookings are explained", async () => {
  const calls = [];
  const bot = createOwnerBot({
    ...settings,
    request: async (url, options) => {
      assert.match(url, /\/rpc\/invitation_owner_manage$/);
      const body = JSON.parse(options.body);
      calls.push(body);
      return Response.json(body.action !== "cancel_booking");
    },
  });
  const edit = await (await bot(update(123, "private", "/editwish " + wishId + " Новый текст\nВторая строка"))).json();
  const remove = await (await bot(update(123, "private", "/deletewish " + wishId + " confirm"))).json();
  const cancel = await (await bot(update(123, "private", "/cancelbooking " + reservationId + " confirm"))).json();
  assert.equal(edit.text, "Пожелание обновлено.");
  assert.equal(remove.text, "Пожелание удалено.");
  assert.match(cancel.text, /Этой брони уже нет/);
  assert.deepEqual(calls, [
    { action: "edit_wish", target_id: wishId, replacement: "Новый текст\nВторая строка" },
    { action: "delete_wish", target_id: wishId, replacement: null },
    { action: "cancel_booking", target_id: reservationId, replacement: null },
  ]);
  const unavailable = createOwnerBot({ ...settings, request: async () => new Response(null, { status: 503 }) });
  assert.equal((await unavailable(update(123, "private", "/deletewish " + wishId + " confirm"))).status, 502);
});

test("buttons navigate, request confirmation and edit with an ordinary Telegram reply", async () => {
  const calls = [];
  const bot = createOwnerBot({ ...settings, botToken: "synthetic-token", request: async (url, options) => {
    const method = url.split("/").at(-1);
    const payload = JSON.parse(options.body);
    calls.push([method, payload]);
    if (method === "invitation_owner_report")
      return Response.json({ rows: [{ id: wishId, name: "Synthetic", message: "Before" }] });
    if (method === "invitation_owner_prepare_edit") return Response.json(null);
    if (method === "invitation_owner_apply_edit" || method === "invitation_owner_manage")
      return Response.json(true);
    if (method === "sendMessage") return Response.json({ok:true,result:{message_id:71}});
    return Response.json({ok:true,result:true});
  }});
  const raw = (payload) => new Request("https://example.invalid/owner-bot", {
    method: "POST", headers: { "X-Telegram-Bot-Api-Secret-Token": settings.secret },
    body: JSON.stringify(payload),
  });
  const button = (data, id=123) => raw({callback_query:{
    id:"synthetic-callback",data,from:{id},message:{message_id:70,chat:{id:123,type:"private"}},
  }});
  assert.equal((await bot(button("confirm-delete:"+wishId, 456))).status, 204);
  assert.equal(calls.length, 0);
  const wish = await (await bot(button("wishes:1"))).json();
  assert.equal(wish.method,"editMessageText");
  assert.equal(wish.message_id,70);
  assert.deepEqual(wish.reply_markup.inline_keyboard[0].map(b=>b.text),["Изменить","Удалить"]);
  assert.doesNotMatch(wish.text,/editwish|deletewish/);
  const prompt = await (await bot(button("delete:"+wishId))).json();
  assert.equal(prompt.reply_markup.inline_keyboard[0][0].callback_data,"confirm-delete:"+wishId);
  assert.equal(calls.some(([method])=>method==="invitation_owner_manage"),false);
  const confirmed = await (await bot(button("confirm-delete:"+wishId))).json();
  assert.equal(confirmed.text,"Пожелание удалено.");
  assert.equal((await bot(button("edit:"+wishId))).status,204);
  assert.ok(calls.some(([method,p])=>method==="sendMessage"&&p.reply_markup.force_reply));
  assert.deepEqual(calls.find(([method])=>method==="invitation_owner_prepare_edit")[1],{
    owner_chat:123,prompt_message:71,wish_id:wishId,
  });
  const reply = await (await bot(raw({message:{
    text:"Новый текст",chat:{id:123,type:"private"},from:{id:123},
    reply_to_message:{message_id:71,from:{is_bot:true}},
  }}))).json();
  assert.equal(reply.text,"Пожелание обновлено на сайте.");
  assert.deepEqual(calls.find(([method])=>method==="invitation_owner_apply_edit")[1],{
    owner_chat:123,prompt_message:71,replacement:"Новый текст",
  });
});

test("menu setup keeps the current webhook and registers only owner commands", async () => {
  const calls=[];
  const bot=createOwnerBot({...settings,botToken:"synthetic-token",request:async(url,options)=>{
    const method=url.split("/").at(-1);
    calls.push([method,JSON.parse(options.body)]);
    return Response.json({ok:true,result:method==="getWebhookInfo"?{url:settings.supabaseUrl+"/functions/v1/owner-bot"}:true});
  }});
  const reply=await (await bot(update(123,"private","/setupmenu"))).json();
  assert.equal(reply.text,"Меню Telegram настроено.");
  assert.deepEqual(calls[1][1].allowed_updates,["message","callback_query"]);
  assert.deepEqual(calls[2][1].scope,{type:"chat",chat_id:123});
  assert.deepEqual(calls[2][1].commands.map(c=>c.command),["start","guests","wishes","bookings"]);
  assert.deepEqual(calls[3],["setChatMenuButton",{chat_id:123,menu_button:{type:"commands"}}]);
});

test("setup reports the exact failed step and never changes an unrelated webhook", async () => {
  const project="https://exampleproject.supabase.co";
  const legacy="https://exampleproject.functions.supabase.co/owner-bot";
  const calls=[];
  let endpoint=legacy;
  const bot=createOwnerBot({...settings,supabaseUrl:project+"/",botToken:" synthetic-token ",
    request:async(url,options)=>{
      assert.ok(url.startsWith("https://api.telegram.org/botsynthetic-token/"));
      const method=url.split("/").at(-1);
      calls.push([method,JSON.parse(options.body)]);
      if(method==="getWebhookInfo")return Response.json({ok:true,result:{url:endpoint}});
      if(method==="setMyCommands")return Response.json({ok:false,error_code:400},{status:400});
      return Response.json({ok:true,result:true});
    },
  });
  const failed=await (await bot(update(123,"private","/setupmenu"))).json();
  assert.match(failed.text,/запись списка команд/);
  assert.match(failed.text,/400/);
  assert.equal(calls[1][1].url,legacy);
  endpoint="https://other.invalid/owner-bot";
  calls.length=0;
  const wrong=await (await bot(update(123,"private","/setupmenu"))).json();
  assert.match(wrong.text,/другому адресу/);
  assert.deepEqual(calls.map(([method])=>method),["getWebhookInfo"]);
});

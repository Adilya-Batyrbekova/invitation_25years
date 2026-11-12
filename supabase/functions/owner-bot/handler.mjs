const titles = {
  guests: ["📋", "Ответы гостей"],
  wishes: ["💌", "Пожелания"],
  bookings: ["🎁", "Действующие брони"],
};
const numbers = new Intl.NumberFormat("ru-KZ");
const recordId = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const actions = {
  editwish: ["edit_wish", "Пожелание обновлено.", "Пожелание уже удалено."],
  deletewish: ["delete_wish", "Пожелание удалено.", "Пожелание уже удалено."],
  cancelbooking: ["cancel_booking", "Бронь снята.", "Этой брони уже нет. Если подарок забронировали заново, новая бронь сохранена."],
};

export function createOwnerBot({
  secret, ownerId, supabaseUrl, serviceKey, format,
  botToken: configuredToken, webhookUrl, request = fetch,
}) {
  const botToken = configuredToken?.trim();
  const html = (value) => value.split("\n").map((line) =>
    format(line).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  ).join("\n");
  async function rpc(name, payload) {
    if (!supabaseUrl || !serviceKey) throw new Error("Missing configuration");
    const response = await request(supabaseUrl + "/rest/v1/rpc/" + name, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: "Bearer " + serviceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.warn("owner-bot RPC HTTP status", response.status);
      throw new Error("RPC failed");
    }
    return response.json();
  }
  const button = (label, data) => ({ text: format(label), callback_data: data });
  const menu = [
    [button("📋 Ответы гостей", "guests:1")],
    [button("💌 Пожелания", "wishes:1"), button("🎁 Брони", "bookings:1")],
  ];
  async function telegram(method, payload) {
    const response = await request("https://api.telegram.org/bot" + botToken + "/" + method, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "error",
      signal: AbortSignal.timeout(8000),
    });
    const body = await response.json();
    if (!response.ok || body.ok !== true) {
      const error = new Error("Telegram API request failed");
      error.status = Number.isInteger(body.error_code) ? body.error_code : response.status;
      throw error;
    }
    return body.result;
  }
  return async (incoming) => {
    if (incoming.method !== "POST") return new Response(null, { status: 405 });
    if (!secret || incoming.headers.get("X-Telegram-Bot-Api-Secret-Token") !== secret) {
      return new Response(null, { status: 401 });
    }
    const update = await incoming.json().catch(() => ({})) ?? {};
    const callback = update.callback_query;
    const message = callback ? callback.message : update.message;
    if (
      !ownerId ||
      message?.chat?.type !== "private" ||
      String((callback?.from ?? message.from)?.id) !== ownerId ||
      String(message.chat.id) !== ownerId
    ) return new Response(null, { status: 204 });
    if (callback && !botToken) return new Response(null, { status: 204 });
    const data = typeof callback?.data === "string" ? callback.data : "";
    const navigation = /^(guests|wishes|bookings):([1-9]\d{0,3}|10000)$/.exec(data);
    const action = /^(edit|delete|cancel|confirm-delete|confirm-cancel):([0-9a-f-]{36})$/i.exec(data);
    const input = navigation
      ? "/" + navigation[1] + " " + navigation[2]
      : !callback && typeof message.text === "string" ? message.text.trim() : "";
    const command = /^\/(guests|wishes|bookings)(?:\s+([1-9]\d{0,3}|10000))?$/.exec(input);
    const manage = /^\/(editwish|deletewish|cancelbooking)(?:\s+(\S+)(?:\s+([\s\S]+))?)?$/.exec(input);
    let text;
    let keyboard;
    let stage = "format";
    try {
      if (callback) {
        await telegram("answerCallbackQuery", { callback_query_id: callback.id }).catch(() => {});
      }
      if (input === "/setupmenu" && botToken) {
        stage = "webhook lookup";
        const endpoint = webhookUrl?.trim() || new URL("/functions/v1/owner-bot", supabaseUrl).href;
        const existing = await telegram("getWebhookInfo", {});
        const configured = new URL(endpoint);
        const accepted = new Set([configured.href]);
        const project = /^([a-z0-9]+)\.supabase\.co$/.exec(configured.hostname)?.[1];
        if (project && configured.pathname === "/functions/v1/owner-bot") {
          accepted.add("https://" + project + ".functions.supabase.co/owner-bot");
        }
        if (!accepted.has(existing.url)) {
          return Response.json({
            method: "sendMessage", chat_id: message.chat.id, protect_content: true,
            text: format("Telegram подключён по другому адресу вебхука. Подключение сохранено. Проверь, что TELEGRAM_BOT_TOKEN принадлежит именно этому боту."),
          });
        }
        if (!existing.allowed_updates?.includes("callback_query") || !existing.allowed_updates?.includes("message")) {
          stage = "webhook update";
          if (await telegram("setWebhook", {
            url: existing.url,
            secret_token: secret,
            allowed_updates: ["message", "callback_query"],
          }) !== true) throw new Error("Webhook update not acknowledged");
        }
        stage = "command list";
        await telegram("setMyCommands", {
          scope: { type: "chat", chat_id: message.chat.id },
          commands: [
            { command: "start", description: format("Главное меню") },
            { command: "guests", description: format("Ответы гостей") },
            { command: "wishes", description: format("Просмотр и правка пожеланий") },
            { command: "bookings", description: format("Просмотр и снятие брони") },
          ],
        });
        stage = "menu button";
        await telegram("setChatMenuButton", {
          chat_id: message.chat.id,
          menu_button: { type: "commands" },
        });
        text = html("Меню Telegram настроено.");
        keyboard = menu;
      } else if (action && recordId.test(action[2])) {
        stage = "manage";
        const [, kind, id] = action;
        if (kind === "edit") {
          const prompt = await telegram("sendMessage", {
            chat_id: message.chat.id,
            text: format("Ответь на это сообщение новым текстом пожелания."),
            protect_content: true,
            reply_markup: { force_reply: true, input_field_placeholder: format("Новый текст пожелания") },
          });
          await rpc("invitation_owner_prepare_edit", {
            owner_chat: message.chat.id, prompt_message: prompt.message_id, wish_id: id,
          });
          return new Response(null, { status: 204 });
        }
        const wish = kind.endsWith("delete");
        if (kind === "delete" || kind === "cancel") {
          text = html(wish ? "Удалить это пожелание?" : "Снять эту бронь?");
          keyboard = [[button(wish ? "Да, удалить" : "Да, снять бронь", "confirm-" + kind + ":" + id), button("Назад", wish ? "wishes:1" : "bookings:1")]];
        } else {
          const [, success, missing] = actions[wish ? "deletewish" : "cancelbooking"];
          const changed = await rpc("invitation_owner_manage", {
            action: wish ? "delete_wish" : "cancel_booking", target_id: id, replacement: null,
          });
          if (typeof changed !== "boolean") throw new Error("Unexpected update result");
          text = html(changed ? success : missing);
          keyboard = [[button(wish ? "К пожеланиям" : "К броням", wish ? "wishes:1" : "bookings:1")]];
        }
      } else if (botToken && !callback && !input.startsWith("/") && message.reply_to_message?.from?.is_bot) {
        stage = "edit reply";
        if (!input || Array.from(input).length > 1500) {
          text = html("Ответь на исходное сообщение бота текстом от 1 до 1500 символов.");
        } else {
          const changed = await rpc("invitation_owner_apply_edit", {
            owner_chat: message.chat.id,
            prompt_message: message.reply_to_message.message_id,
            replacement: input,
          });
          text = html(changed === true ? "Пожелание обновлено на сайте." : "Этот запрос на правку устарел или пожелание удалено. Открой пожелания и нажми «Изменить» снова.");
          keyboard = [[button("К пожеланиям", "wishes:1")]];
        }
      } else if (manage) {
        stage = "manage";
        const [, name, id, argument] = manage;
        const edit = name === "editwish";
        if (!id || !recordId.test(id)) {
          text = html(edit || name === "deletewish"
            ? "Скопируй команду нужного пожелания из /wishes."
            : "Скопируй команду нужной брони из /bookings.");
        } else if (edit && (!argument || Array.from(argument).length > 1500)) {
          text = html("Добавь после команды новый текст пожелания. Максимум 1500 символов.");
        } else if (!edit && argument !== "confirm") {
          text = html(name === "deletewish" ? "Чтобы удалить пожелание, отправь команду целиком:" : "Чтобы снять бронь, отправь команду целиком:")
            + "\n<code>/" + name + " " + id + " confirm</code>";
        } else {
          const [action, success, missing] = actions[name];
          const changed = await rpc("invitation_owner_manage", {
            action,
            target_id: id,
            replacement: edit ? argument : null,
          });
          if (typeof changed !== "boolean") throw new Error("Unexpected update result");
          text = html(changed ? success : missing);
        }
      } else if (command) {
        if (!supabaseUrl || !serviceKey) return new Response(null, { status: 503 });
        stage = "report";
        const kind = command[1];
        const page = Number(command[2] ?? 1);
        const report = await rpc("invitation_owner_report", { report_kind: kind, report_page: page });
        stage = "format";
        const size = kind === "wishes" ? 1 : 12;
        const lines = report.rows.slice(0, size).map((row) => {
          if (kind === "guests") return `<b>${html(row.name)}</b> — ${html(row.attending ? "приду" : "не приду")}`;
          if (kind === "wishes") {
            const wish = `<b>${html(row.name)}</b>\n${html(row.message)}`;
            return !botToken && recordId.test(row.id)
              ? wish + `\n\n${html("Чтобы изменить текст, допиши его после команды:")}\n<code>/editwish ${row.id}</code>\n\n<code>/deletewish ${row.id}</code>`
              : wish;
          }
          const label = row.gift_name
            ? Array.from(row.gift_name).slice(0, 120).join("")
            : "Подарок № " + row.gift_id;
          const price = row.price_kzt === null ? "" : " — " + html(numbers.format(row.price_kzt) + " ₸");
          const booking = `<b>${html(label)}</b>${price}`;
          return !botToken && recordId.test(row.reservation_id)
            ? booking + `\n<code>/cancelbooking ${row.reservation_id}</code>`
            : booking;
        });
        const [icon, title] = titles[kind];
        const sections = [`${icon} <b>${html(title)}</b>`];
        if (kind === "guests") {
          sections.push(`✅ ${html("Придут")} — <b>${numbers.format(report.yes)}</b>\n✖️ ${html("Не придут")} — <b>${numbers.format(report.no)}</b>`);
        }
        sections.push(lines.join("\n") || `<i>${html("Пока нет записей для показа.")}</i>`);
        if (botToken) {
          keyboard = [];
          const wish = report.rows[0];
          if (kind === "wishes" && recordId.test(wish?.id)) {
            keyboard.push([button("Изменить", "edit:" + wish.id), button("Удалить", "delete:" + wish.id)]);
          }
          if (kind === "bookings") {
            for (const row of report.rows.slice(0, size)) {
              if (!recordId.test(row.reservation_id)) continue;
              const label = Array.from(row.gift_name || "Подарок № " + row.gift_id).slice(0, 32).join("");
              keyboard.push([button("Снять бронь · " + label, "cancel:" + row.reservation_id)]);
            }
          }
          const paging = [];
          if (page > 1) paging.push(button("← Назад", kind + ":" + (page - 1)));
          if (report.rows.length > size && page < 10000) paging.push(button("Далее →", kind + ":" + (page + 1)));
          if (paging.length) keyboard.push(paging);
          keyboard.push([button("Главное меню", "home")]);
        } else if (report.rows.length > size && page < 10000) {
          sections.push(`<i>${html("Показать ещё")}</i> · /${kind} ${page + 1}`);
        }
        text = sections.join("\n\n");
      } else {
        if (botToken) {
          keyboard = menu;
          text = `✉️ <b>${html("Моё приглашение")}</b>\n\n${html("Выбери, что хочешь посмотреть.")}`;
        } else text = [
          `✉️ <b>${html("Моё приглашение")}</b>`,
          `<i>${html("Здесь можно посмотреть ответы гостей и управлять пожеланиями и бронями.")}</i>`,
          "",
          `📋 /guests — ${html("кто придёт")}`,
          `💌 /wishes — ${html("пожелания гостей")}`,
          `🎁 /bookings — ${html("посмотреть и отменить брони")}`,
        ].join("\n");
      }
      return Response.json({
        method: callback ? "editMessageText" : "sendMessage",
        chat_id: message.chat.id,
        text,
        parse_mode: "HTML",
        ...(callback ? { message_id: message.message_id } : { protect_content: true }),
        ...(keyboard && { reply_markup: { inline_keyboard: keyboard } }),
      });
    } catch (error) {
      console.warn("owner-bot failed at stage", stage);
      if (botToken) {
        return Response.json({
          method: "sendMessage", chat_id: message.chat.id, protect_content: true,
          text: format(input === "/setupmenu"
            ? (error?.status === 401 || error?.status === 404
                ? "Telegram отклонил токен. Проверь TELEGRAM_BOT_TOKEN в Supabase и повтори /setupmenu."
                : "Не удалось настроить меню. Шаг: " + ({
                    "webhook lookup": "проверка подключения бота",
                    "webhook update": "включение кнопок",
                    "command list": "запись списка команд",
                    "menu button": "установка кнопки меню",
                  }[stage] ?? "запуск настройки") +
                  (Number.isInteger(error?.status) ? ". Код Telegram: " + error.status : "") + ".")
            : "Не удалось подтвердить действие. Открой нужный раздел ещё раз и проверь запись."),
        });
      }
      return new Response(null, { status: 502 });
    }
  };
}

const titles = {
  guests: ["📋", "Ответы гостей"],
  wishes: ["💌", "Пожелания"],
  bookings: ["🎁", "Действующие брони"],
};
const numbers = new Intl.NumberFormat("ru-KZ");

export function createOwnerBot({
  secret, ownerId, supabaseUrl, serviceKey, format,
  request = fetch,
}) {
  const html = (value) => value.split("\n").map((line) =>
    format(line).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  ).join("\n");
  return async (incoming) => {
    if (incoming.method !== "POST") return new Response(null, { status: 405 });
    if (!secret || incoming.headers.get("X-Telegram-Bot-Api-Secret-Token") !== secret) {
      return new Response(null, { status: 401 });
    }
    const { message } = await incoming.json().catch(() => ({})) ?? {};
    if (
      !ownerId ||
      message?.chat?.type !== "private" ||
      String(message.from?.id) !== ownerId ||
      String(message.chat.id) !== ownerId
    ) return new Response(null, { status: 204 });
    const command = /^\/(guests|wishes|bookings)(?:\s+([1-9]\d{0,3}|10000))?$/.exec(
      typeof message.text === "string" ? message.text.trim() : "",
    );
    let text;
    let stage = "format";
    try {
      if (command) {
        if (!supabaseUrl || !serviceKey) return new Response(null, { status: 503 });
        stage = "report";
        const kind = command[1];
        const page = Number(command[2] ?? 1);
        const response = await request(supabaseUrl + "/rest/v1/rpc/invitation_owner_report", {
          method: "POST",
          headers: {
            apikey: serviceKey,
            Authorization: "Bearer " + serviceKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ report_kind: kind, report_page: page }),
        });
        if (!response.ok) {
          console.warn("owner-bot report HTTP status", response.status);
          return new Response(null, { status: 502 });
        }
        const report = await response.json();
        stage = "format";
        const size = kind === "wishes" ? 1 : 12;
        const lines = report.rows.slice(0, size).map((row) => {
          if (kind === "guests") return `<b>${html(row.name)}</b> — ${html(row.attending ? "приду" : "не приду")}`;
          if (kind === "wishes") return `<b>${html(row.name)}</b>\n${html(row.message)}`;
          const label = row.gift_name
            ? Array.from(row.gift_name).slice(0, 120).join("")
            : "Подарок № " + row.gift_id;
          const price = row.price_kzt === null ? "" : " — " + html(numbers.format(row.price_kzt) + " ₸");
          return `<b>${html(label)}</b>${price}`;
        });
        const [icon, title] = titles[kind];
        const sections = [`${icon} <b>${html(title)}</b>`];
        if (kind === "guests") {
          sections.push(`✅ ${html("Придут")} — <b>${numbers.format(report.yes)}</b>\n✖️ ${html("Не придут")} — <b>${numbers.format(report.no)}</b>`);
        }
        sections.push(lines.join("\n") || `<i>${html("Пока нет записей для показа.")}</i>`);
        if (report.rows.length > size && page < 10000) {
          sections.push(`<i>${html("Показать ещё")}</i> · /${kind} ${page + 1}`);
        }
        text = sections.join("\n\n");
      } else {
        text = [
          `✉️ <b>${html("Моё приглашение")}</b>`,
          `<i>${html("Здесь можно посмотреть ответы гостей, пожелания и брони.")}</i>`,
          "",
          `📋 /guests — ${html("кто придёт")}`,
          `💌 /wishes — ${html("пожелания гостей")}`,
          `🎁 /bookings — ${html("забронированные подарки")}`,
        ].join("\n");
      }
      return Response.json({
        method: "sendMessage",
        chat_id: message.chat.id,
        text,
        parse_mode: "HTML",
        protect_content: true,
      });
    } catch {
      console.warn("owner-bot failed at stage", stage);
      return new Response(null, { status: 502 });
    }
  };
}

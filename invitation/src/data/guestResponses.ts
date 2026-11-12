import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const guestResponsesEnabled = Boolean(url && key);
const client = url && key ? createClient(url, key) : undefined;
const retryMessage =
  "Не получилось сохранить. Попробуй ещё раз чуть позже — всё написанное осталось на месте.";

export interface Wish {
  id: string;
  name: string;
  message: string;
}

let guestSession: Promise<void> | undefined;
function ensureGuestSession() {
  guestSession ??= (async () => {
    if (!client) throw new Error(retryMessage);
    const { data, error } = await client.auth.getSession();
    if (error) throw new Error(retryMessage);
    if (data.session) return;
    const result = await client.auth.signInAnonymously();
    if (result.error) throw new Error(retryMessage);
  })().finally(() => {
    guestSession = undefined;
  });
  return guestSession;
}

export async function saveGuestResponse(
  fields: FormData,
  wish: boolean,
  wishId?: string,
) {
  const name = String(fields.get("name") ?? "").trim();
  const message = String(fields.get("wish") ?? "").trim();
  const attendance = fields.get("attendance");
  if (!name || (wish && !message)) {
    throw new Error("Заполни, пожалуйста, все поля.");
  }
  if (!client || (!wish && attendance !== "yes" && attendance !== "no")) {
    throw new Error(retryMessage);
  }
  await ensureGuestSession();

  if (wish && wishId) {
    const { data, error } = await client
      .from("wishes")
      .update({ name, message })
      .eq("id", wishId)
      .select("id")
      .maybeSingle();
    if (error || !data) throw new Error(retryMessage);
    return;
  }

  const { error } = wish
    ? await client.from("wishes").insert({ name, message })
    : await client.from("attendance").insert({
        name,
        attending: attendance === "yes",
      });
  if (error?.code === "23505" && !wish) {
    throw new Error(
      "Ответ с этим именем уже есть. Если планы изменились, напиши мне.",
    );
  }
  if (error) throw new Error(retryMessage);
}

export async function readWishes(limit: number) {
  if (!client) throw new Error(retryMessage);
  const { data, error } = await client
    .from("wishes")
    .select("id,name,message")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);
  if (error)
    throw new Error("Не получилось загрузить пожелания. Попробуй ещё раз.");
  const session = await client.auth.getSession();
  const own = session.data.session
    ? await client.rpc("own_wish_ids")
    : undefined;
  return { wishes: data as Wish[], ownIds: new Set<string>(own?.data ?? []) };
}

export type GiftReservationStatus = {
  gift_id: number;
  bookable: boolean;
  reserved: boolean;
  own: boolean;
};

export async function readGiftReservations() {
  if (!client) return undefined;
  const { data, error } = await client.rpc("invitation_gift_availability");
  return error ? undefined : (data as GiftReservationStatus[]);
}

export async function updateGiftReservation(id: number, giver?: string) {
  if (!client) throw new Error(retryMessage);
  try {
    await ensureGuestSession();
  } catch {
    throw new Error(
      "Не удалось открыть гостевую сессию. Обнови страницу и попробуй ещё раз.",
    );
  }
  const { data, error } =
    giver === undefined
      ? await client.rpc("cancel_invitation_gift", { requested_id: id })
      : await client.rpc("reserve_invitation_gift", {
          requested_id: id,
          giver: giver.trim(),
        });
  if (error?.code === "22023")
    throw new Error("Этот подарок ещё не опубликован для бронирования.");
  if (error?.code === "42501")
    throw new Error(
      "Сервис бронирования отклонил запрос. Попробуй ещё раз чуть позже.",
    );
  if (error) throw new Error(retryMessage);
  return data === true;
}

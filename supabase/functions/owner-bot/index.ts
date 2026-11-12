import { t } from "../../../invitation/src/lib/typography.ts";
import { createOwnerBot } from "./handler.mjs";

Deno.serve(createOwnerBot({
  secret: Deno.env.get("TELEGRAM_WEBHOOK_SECRET"),
  ownerId: Deno.env.get("TELEGRAM_OWNER_ID"),
  supabaseUrl: Deno.env.get("SUPABASE_URL"),
  botToken: Deno.env.get("TELEGRAM_BOT_TOKEN"),
  webhookUrl: Deno.env.get("TELEGRAM_WEBHOOK_URL"),
  serviceKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  format: t,
}));

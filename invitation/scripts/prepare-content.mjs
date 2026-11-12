import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseContent } from "./local-content.mjs";
import { normalizeIdeas } from "../src/data/ideasContent.mjs";

const root = new URL("../", import.meta.url);
const draftDir = new URL(".local-content/", root);
const publicDir = new URL("public/", root);
export async function prepareContent(
  content,
  {
    draft = draftDir,
    output = publicDir,
    section,
    source = process.env.VITE_SUPABASE_URL,
  } = {},
) {
  const imageDir = new URL("editor-images/", output);
  const copies = new Map();
  const sourceOrigin = source ? new URL(source).origin : undefined;

  async function prepareImage(src) {
    if (typeof src !== "string") throw new Error("Invalid image reference");
    if (/^art\/[a-z0-9_.-]+$/i.test(src)) {
      await readFile(new URL(src, output));
      return src;
    }
    if (copies.has(src)) return copies.get(src).path;
    let bytes;
    let extension;
    const local = /^editor-images\/([0-9a-f-]{36}\.(webp|png|jpeg))$/.exec(src);
    if (local) {
      extension = local[2];
      bytes = await readFile(new URL("images/" + local[1], draft)).catch(
        (error) => {
          if (error.code !== "ENOENT") throw error;
          return readFile(new URL(src, output));
        },
      );
    } else if (/^editor-images\/[0-9a-f]{64}\.(?:webp|png|jpeg)$/.test(src)) {
      await readFile(new URL(src, output));
      return src;
    } else {
      const url = new URL(src);
      const cloud =
        /^\/storage\/v1\/object\/public\/invitation-images\/[0-9a-f-]{36}\.(webp|png|jpeg)$/.exec(
          url.pathname,
        );
      if (!cloud || url.protocol !== "https:" || url.origin !== sourceOrigin) {
        throw new Error(
          "Unexpected image source. Check the original Supabase project URL.",
        );
      }
      extension = cloud[1];
      const response = await fetch(url, {
        redirect: "error",
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok)
        throw new Error("Could not read an existing published image");
      bytes = Buffer.from(await response.arrayBuffer());
    }
    if (!bytes.length || bytes.length > 8 * 1024 * 1024)
      throw new Error("Image exceeds publication limit");
    const path =
      "editor-images/" +
      createHash("sha256").update(bytes).digest("hex") +
      "." +
      extension;
    copies.set(src, { path, bytes });
    return path;
  }

  if (!section || section === "ideas") {
    content.ideas = normalizeIdeas(content.ideas);
    for (const card of content.ideas.cards) {
      card.photos = await Promise.all(card.photos.map(prepareImage));
      for (const item of card.items) {
        if (item.photos)
          item.photos = await Promise.all(item.photos.map(prepareImage));
      }
    }
  }
  if (!section || section === "personal") {
    for (const story of content.personal.stories) {
      story.photos = await Promise.all((story.photos ?? []).map(prepareImage));
    }
  }
  if (!section) {
    for (const gift of content.gifts.items) {
      for (const image of gift.images ?? [])
        image.src = await prepareImage(image.src);
    }
  }

  const quote = (value) => "'" + value.replaceAll("'", "''") + "'";
  const rows = content.gifts.items.map(
    (gift) =>
      "(" + [gift.id, quote(gift.name), gift.price, "true"].join(", ") + ")",
  );
  const registry = [
    "begin;",
    "set local standard_conforming_strings = on;",
    "update private.invitation_gift_registry set bookable = false;",
    ...(rows.length
      ? [
          "insert into private.invitation_gift_registry (gift_id, gift_name, price_kzt, bookable)",
          "values " + rows.join(",\n"),
          "on conflict (gift_id) do update set gift_name = excluded.gift_name,",
          "  price_kzt = excluded.price_kzt, bookable = excluded.bookable;",
        ]
      : []),
    "commit;",
    "",
  ].join("\n");

  await mkdir(imageDir, { recursive: true });
  for (const { path, bytes } of copies.values()) {
    await writeFile(new URL(path, output), bytes, { flag: "wx" }).catch(
      async (error) => {
        if (
          error.code !== "EEXIST" ||
          !(await readFile(new URL(path, output))).equals(bytes)
        )
          throw error;
      },
    );
  }
  if (!section) await writeFile(new URL("gift-registry.sql", draft), registry);
  const pending = new URL(randomUUID() + ".tmp", draft);
  await writeFile(
    pending,
    JSON.stringify(section ? content[section] : content, null, 2) + "\n",
    {
      flag: "wx",
    },
  );
  await rename(
    pending,
    new URL("invitation-" + (section ?? "content") + ".json", output),
  );
  return [...new Set([...copies.values()].map(({ path }) => path))];
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const section = process.argv[2] === "--ideas-only" ? "ideas" : undefined;
  const content = parseContent(
    await readFile(new URL("draft.json", draftDir), "utf8"),
  );
  await prepareContent(content, { section });
  console.log("Prepared content for review in " + fileURLToPath(publicDir));
  if (!section)
    console.log(
      "Review .local-content/gift-registry.sql before publishing the catalogue.",
    );
}

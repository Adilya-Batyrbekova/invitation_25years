import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parseContent } from "./local-content.mjs";

const root = new URL("../", import.meta.url);
const draftDir = new URL(".local-content/", root);
const publicDir = new URL("public/", root);
const content = parseContent(
  await readFile(new URL("draft.json", draftDir), "utf8"),
);
const imageDir = new URL("editor-images/", publicDir);
const copies = new Map();
const sourceOrigin = process.env.VITE_SUPABASE_URL
  ? new URL(process.env.VITE_SUPABASE_URL).origin
  : undefined;

async function prepareImage(src) {
  if (typeof src !== "string") throw new Error("Invalid image reference");
  if (/^art\/[a-z0-9_.-]+$/i.test(src)) {
    await readFile(new URL(src, publicDir));
    return src;
  }
  if (copies.has(src)) return copies.get(src).path;
  let bytes;
  let extension;
  const local = /^editor-images\/([0-9a-f-]{36}\.(webp|png|jpeg))$/.exec(src);
  if (local) {
    extension = local[2];
    bytes = await readFile(new URL("images/" + local[1], draftDir)).catch(
      (error) => {
        if (error.code !== "ENOENT") throw error;
        return readFile(new URL(src, publicDir));
      },
    );
  } else if (/^editor-images\/[0-9a-f]{64}\.(?:webp|png|jpeg)$/.test(src)) {
    await readFile(new URL(src, publicDir));
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

for (const story of content.personal.stories) {
  if (story.photos)
    story.photos = await Promise.all(story.photos.map(prepareImage));
}
content.ideas.interiorPhotos = await Promise.all(
  content.ideas.interiorPhotos.map(prepareImage),
);
if (content.ideas.cupsPhotos)
  content.ideas.cupsPhotos = await Promise.all(
    content.ideas.cupsPhotos.map(prepareImage),
  );
for (const gift of content.gifts.items) {
  for (const image of gift.images ?? [])
    image.src = await prepareImage(image.src);
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
  await writeFile(new URL(path, publicDir), bytes, { flag: "wx" }).catch(
    async (error) => {
      if (
        error.code !== "EEXIST" ||
        !(await readFile(new URL(path, publicDir))).equals(bytes)
      )
        throw error;
    },
  );
}
await writeFile(new URL("gift-registry.sql", draftDir), registry);
const pending = new URL(randomUUID() + ".tmp", draftDir);
await writeFile(pending, JSON.stringify(content, null, 2) + "\n", {
  flag: "wx",
});
await rename(pending, new URL("invitation-content.json", publicDir));
console.log("Prepared content for review in " + fileURLToPath(publicDir));
console.log(
  "Review .local-content/gift-registry.sql before publishing the catalogue.",
);

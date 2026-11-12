import { createClient } from "@supabase/supabase-js";
import type { EditorContent } from "./editorContent";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const giftOwner =
  url && key
    ? createClient(url, key, {
        auth: { storageKey: "invitation-owner", flowType: "pkce" },
      })
    : undefined;

const storageLimit = 2 * 1024 * 1024;

async function preparePhoto(src: string) {
  if (/^art\/[a-z0-9_.-]+$/i.test(src)) return src;
  if (/^editor-images\/[0-9a-f]{64}\.(?:png|jpeg|webp)$/.test(src)) return src;
  const local = /^editor-images\/([0-9a-f-]{36}\.(?:png|jpeg|webp))$/.exec(src);
  if (!local) {
    const image = new URL(src);
    if (
      image.origin === new URL(url).origin &&
      /^\/storage\/v1\/object\/public\/invitation-images\/[0-9a-f-]{36}\.(?:png|jpeg|webp)$/.test(
        image.pathname,
      )
    )
      return src;
    throw new Error("Unexpected gift photo");
  }

  const response = await fetch("/" + src);
  if (!response.ok) throw new Error("Gift photo unavailable");
  let photo = await response.blob();
  let extension = local[1].split(".").at(-1);
  if (photo.size > storageLimit) {
    const bitmap = await createImageBitmap(photo);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    try {
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
      const converted = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.86),
      );
      if (
        !converted ||
        converted.type !== "image/webp" ||
        converted.size > storageLimit
      )
        throw new Error("Gift photo exceeds storage limit");
      photo = converted;
      extension = "webp";
    } finally {
      bitmap.close();
    }
  }
  const bucket = giftOwner!.storage.from("invitation-images");
  const name = local[1].replace(/\.[^.]+$/, "." + extension);
  const { data } = bucket.getPublicUrl(name);
  const { error } = await bucket.upload(name, photo, { upsert: false });
  if (error) {
    const existing = await fetch(data.publicUrl, { cache: "no-store" });
    if (!existing.ok) throw error;
    const digest = async (blob: Blob) =>
      new Uint8Array(
        await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()),
      );
    const [wanted, stored] = await Promise.all([
      digest(photo),
      digest(await existing.blob()),
    ]);
    if (wanted.some((byte, index) => byte !== stored[index])) throw error;
  }
  return data.publicUrl;
}

export async function publishGifts(gifts: EditorContent["gifts"]) {
  if (!giftOwner) throw new Error("Owner connection unavailable");
  const { data: allowed, error: permission } = await giftOwner.rpc(
    "can_edit_invitation",
  );
  if (permission || allowed !== true) throw new Error("Owner access required");

  const items = [];
  const photos = new Map<string, Promise<string>>();
  for (const gift of gifts.items) {
    const images = [];
    for (const image of gift.images ?? []) {
      const pending = photos.get(image.src) ?? preparePhoto(image.src);
      photos.set(image.src, pending);
      images.push({ ...image, src: await pending });
    }
    const { id, name, price, category, description, note, shape } = gift;
    const shop = gift.shop && { name: gift.shop.name, url: gift.shop.url };
    items.push({
      id,
      name,
      price,
      category,
      description,
      note,
      shape,
      shop,
      images,
      availability: "available",
    });
  }
  const { error } = await giftOwner.rpc("publish_invitation_gifts", {
    catalogue: { intro: gifts.intro, items },
  });
  if (error) throw error;
}

export function parseContent(raw) {
  const content = JSON.parse(raw);
  if (
    !content ||
    !Array.isArray(content.personal?.stories) ||
    !Array.isArray(content.personal?.preferences) ||
    !Array.isArray(content.ideas?.books) ||
    !Array.isArray(content.ideas?.interiorPhotos) ||
    !Array.isArray(content.gifts?.items)
  ) {
    throw new Error("Missing content sections");
  }
  const ids = new Set();
  for (const gift of content.gifts.items) {
    if (!Number.isSafeInteger(gift.id) || gift.id < 1 || ids.has(gift.id)) {
      throw new Error("Gift IDs must be distinct positive safe integers");
    }
    if (
      typeof gift.name !== "string" ||
      !gift.name.trim() ||
      !Number.isSafeInteger(gift.price) ||
      gift.price < 0
    ) {
      throw new Error("A gift needs a name and an integer price");
    }
    ids.add(gift.id);
  }
  return content;
}

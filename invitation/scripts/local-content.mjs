import { normalizeIdeas } from "../src/data/ideasContent.mjs";

export function parseContent(raw) {
  const content = JSON.parse(raw);
  if (
    !content ||
    !Array.isArray(content.personal?.stories) ||
    !Array.isArray(content.personal?.preferences) ||
    typeof content.ideas?.intro !== "string" ||
    !Array.isArray(content.gifts?.items)
  ) {
    throw new Error("Missing content sections");
  }
  if (
    !("cards" in content.ideas) &&
    (!Array.isArray(content.ideas.books) ||
      !Array.isArray(content.ideas.interiorPhotos))
  )
    throw new Error("Invalid preferences");
  content.ideas = normalizeIdeas(content.ideas);
  const photoList = (photos) =>
    Array.isArray(photos) && photos.every((photo) => typeof photo === "string");
  const cardIds = new Set();
  if (
    !Array.isArray(content.ideas.cards) ||
    !content.ideas.cards.every((card) => {
      if (
        !card ||
        typeof card.id !== "string" ||
        !card.id ||
        cardIds.has(card.id) ||
        typeof card.title !== "string" ||
        typeof card.description !== "string" ||
        !photoList(card.photos) ||
        !Array.isArray(card.items) ||
        !card.items.every(
          (item) =>
            item &&
            typeof item.label === "string" &&
            typeof item.value === "string" &&
            (item.photos === undefined || photoList(item.photos)),
        )
      )
        return false;
      cardIds.add(card.id);
      return true;
    })
  )
    throw new Error("Invalid preference cards");
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

/** @typedef {{ label: string, value: string, photos?: string[] }} IdeaItem */
/** @typedef {{ id: string, title: string, description: string, photos: string[], items: IdeaItem[], galleryAfterItems?: boolean }} IdeaCard */
/** @typedef {{ intro: string, cards: IdeaCard[] }} Ideas */
/** @typedef {{ intro: string, interiorTitle: string, interiorText: string, interiorPhotos: string[], booksTitle: string, books: IdeaItem[], cupsTitle: string, cupsText: string, cupsPhotos?: string[] }} LegacyIdeas */

/** @param {Ideas | LegacyIdeas} ideas @returns {Ideas} */
export function normalizeIdeas(ideas) {
  if ("cards" in ideas) return ideas;
  return {
    intro: ideas.intro,
    cards: [
      {
        id: "interior",
        title: ideas.interiorTitle,
        description: ideas.interiorText,
        photos: ideas.interiorPhotos,
        items: [],
      },
      {
        id: "books",
        title: ideas.booksTitle,
        description: "",
        photos: [],
        items: ideas.books,
      },
      {
        id: "cups",
        title: ideas.cupsTitle,
        description: ideas.cupsText,
        photos: ideas.cupsPhotos ?? [
          "art/celebration.webp",
          "art/bouquet.webp",
          "art/painted-butterfly.png",
        ],
        items: [],
      },
    ],
  };
}

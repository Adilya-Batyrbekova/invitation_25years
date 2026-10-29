// Source copy is retained here. Render through t(); do not edit content to fix wrapping.
export const copy = {
  flower: "Принеси один цветок, который напоминает тебе обо мне.",
  flowerMore:
    "Из этих цветов соберём общий букет. Мне будет интересно узнать, почему ты выбрал именно этот цветок.",
  personal:
    "Немного фактов, любимых вещей и историй, из которых складываются мои 25.",
};
export interface Gift {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  note?: string;
  images?: { src: string; alt: string }[];
  availability: "available" | "reserved" | "own";
  shop?: { name: string; url: string };
  shape: "book" | "cup" | "vase" | "camera" | "candle" | "paint";
}
// Owner-authorized provisional catalogue for layout review; no real reservations or purchases.
export const gifts: Gift[] = [
  {
    id: 1,
    name: "Книга для тихого вечера",
    price: 6500,
    category: "Книги",
    description:
      "Красивая история, к которой захочется возвращаться. Бумажная книга в твёрдом переплёте.",
    availability: "available",
    shape: "book",
  },
  {
    id: 2,
    name: "Керамическая чашка",
    price: 8500,
    category: "Для дома",
    description:
      "Для долгих разговоров и горячего чая. Нежная керамика ручной работы.",
    availability: "available",
    shape: "cup",
  },
  {
    id: 3,
    name: "Ваза для полевых цветов",
    price: 12000,
    category: "Для дома",
    description:
      "Небольшая ваза необычной формы для букетов с личной историей.",
    availability: "available",
    shape: "vase",
  },
  {
    id: 4,
    name: "Маленькая плёночная камера",
    price: 18000,
    category: "Впечатления",
    description:
      "Чтобы сохранить самые обычные и самые дорогие моменты на плёнке.",
    availability: "available",
    shape: "camera",
  },
  {
    id: 5,
    name: "Свеча с тёплым ароматом",
    price: 4500,
    category: "Для дома",
    description: "Мягкий свет и спокойный аромат для уютного вечера.",
    availability: "available",
    shape: "candle",
  },
  {
    id: 6,
    name: "Акварель и новые истории",
    price: 14000,
    category: "Творчество",
    description:
      "Набор акварели для цветов, открыток и маленьких рисунков на память.",
    availability: "available",
    shape: "paint",
  },
];
export function filterGifts(
  category: string,
  budget: number,
  sort: string,
  minimum = 0,
) {
  const result = gifts.filter(
    (g) =>
      (category === "Все" || g.category === category) &&
      g.price <= budget &&
      g.price >= minimum,
  );
  return result.sort((a, b) =>
    sort === "cheap"
      ? a.price - b.price
      : sort === "expensive"
        ? b.price - a.price
        : a.id - b.id,
  );
}

// Source copy is retained here. Render through t(); do not edit content to fix wrapping.
export const copy = {
  greeting: "Хочу отпраздновать этот день с тобой",
  greetingBody:
    "Давай соберёмся, поболтаем, посмеёмся и съедим что-нибудь вкусное. Мне хочется провести этот день с близкими людьми — и с тобой тоже.",
  flower:
    "Мне хочется собрать необычный букет — из цветов, которые напоминают вам обо мне.",
  flowerMore:
    "Если тебе откликается эта идея, принеси один такой цветок. Любой: за цвет, характер или вашу собственную историю. Мне будет интересно узнать, почему ты выбрал именно его.",
  important:
    "Даже без цветка и подарка: я очень хочу провести этот день с тобой.",
  wishlist:
    "А если хочется подарить что-то ещё, я собрала небольшой вишлист. Это просто подсказка, никаких обязательств.",
  personal:
    "Немного фактов, любимых вещей и историй, из которых складываются мои 25.",
  memory:
    "Оставь здесь несколько слов. А фотографии и видео после праздника соберём в нашей группе.",
};
export interface Gift {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
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
    shape: "book",
  },
  {
    id: 2,
    name: "Керамическая чашка",
    price: 8500,
    category: "Для дома",
    description:
      "Для долгих разговоров и горячего чая. Нежная керамика ручной работы.",
    shape: "cup",
  },
  {
    id: 3,
    name: "Ваза для полевых цветов",
    price: 12000,
    category: "Для дома",
    description:
      "Небольшая ваза необычной формы для букетов с личной историей.",
    shape: "vase",
  },
  {
    id: 4,
    name: "Маленькая плёночная камера",
    price: 18000,
    category: "Впечатления",
    description:
      "Чтобы сохранить самые обычные и самые дорогие моменты на плёнке.",
    shape: "camera",
  },
  {
    id: 5,
    name: "Свеча с тёплым ароматом",
    price: 4500,
    category: "Для дома",
    description: "Мягкий свет и спокойный аромат для уютного вечера.",
    shape: "candle",
  },
  {
    id: 6,
    name: "Акварель и новые истории",
    price: 14000,
    category: "Творчество",
    description:
      "Набор акварели для цветов, открыток и маленьких рисунков на память.",
    shape: "paint",
  },
];
export function filterGifts(category: string, budget: number, sort: string) {
  const result = gifts.filter(
    (g) => (category === "Все" || g.category === category) && g.price <= budget,
  );
  return result.sort((a, b) =>
    sort === "cheap"
      ? a.price - b.price
      : sort === "expensive"
        ? b.price - a.price
        : a.id - b.id,
  );
}

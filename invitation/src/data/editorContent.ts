import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { copy, gifts, type Gift } from "./content";

type Story = {
  id: number;
  title: string;
  label: string;
  description: string;
  photos?: string[];
};
export type EditorContent = {
  personal: {
    showLink?: boolean;
    intro: string;
    stories: Story[];
    preferences: { label: string; value: string }[];
  };
  ideas: {
    intro: string;
    interiorTitle: string;
    interiorText: string;
    interiorPhotos: string[];
    booksTitle: string;
    books: { label: string; value: string; photos?: string[] }[];
    cupsTitle: string;
    cupsText: string;
    cupsPhotos?: string[];
  };
  gifts: { intro: string; items: Gift[] };
};

export const defaults: EditorContent = {
  personal: {
    intro: copy.personal,
    stories: [
      [
        "Маленькая я",
        "Фотография из детства",
        "У каждой истории есть начало. Здесь будет один из первых кадров моей. В детстве даже самый обычный день мог стать маленьким приключением. Хочется сохранить эти воспоминания: любимые места, знакомые голоса и ощущение, что впереди ещё столько интересного. Иногда один снимок напоминает обо всём этом лучше длинного рассказа.",
      ],
      [
        "Один счастливый день",
        "Недавняя фотография",
        "Есть моменты, которые хочется сохранить не только в телефоне.",
      ],
      [
        "Маленькие радости",
        "Любимая вещь",
        "Самое дорогое не всегда большое. Иногда это вещь, у которой есть своя история. Её можно взять в руки и вспомнить человека, встречу или путешествие. Я люблю такие незаметные напоминания о счастливых моментах. У каждого из них своё место в моей истории.",
      ],
      [
        "Моменты рядом",
        "Кадр на память",
        "Люблю фотографии, к которым хочется возвращаться.",
      ],
    ].map(([title, label, description], id) => ({
      id,
      title,
      label,
      description,
    })),
    preferences: [
      { label: "Люблю", value: "цветы с характером" },
      { label: "Могу бесконечно говорить", value: "о дорогих сердцу моментах" },
      { label: "Самое ценное", value: "люди рядом" },
    ],
  },
  ideas: {
    intro:
      "Идеи, от которых можно оттолкнуться, если хочется выбрать подарок самостоятельно.",
    interiorTitle: "Интерьер с характером",
    interiorText:
      "Необычные ковры, яркое постельное бельё и картинки, которые хочется повесить дома.",
    interiorPhotos: [
      "art/bouquet.webp",
      "art/celebration.webp",
      "art/painted-butterfly.png",
    ],
    booksTitle: "Книжная полка",
    books: [
      {
        label: "Книги и авторы",
        value:
          "Книги, к которым хочется возвращаться, и истории, которые ещё только предстоит открыть.",
      },
      {
        label: "Издательства и оформление",
        value:
          "Особенно интересно, когда оформление обложки передаёт настроение книги.",
      },
    ],
    cupsTitle: "Коллекция кружек",
    cupsText: "Кружки необычной формы, с интересной ручкой или рисунком.",
  },
  gifts: {
    intro:
      "Если сложно выбрать подарок, здесь собраны готовые идеи. Самое главное — приходи.",
    items: gifts,
  },
};

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const publicClient =
  url && key
    ? createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
    : undefined;

async function readPublishedSection<K extends keyof EditorContent>(section: K) {
  if (section === "gifts") return;
  const response = await fetch(
    import.meta.env.BASE_URL + "invitation-" + section + ".json",
  ).catch(() => undefined);
  if (
    response?.ok &&
    response.headers.get("Content-Type")?.includes("application/json")
  ) {
    return (await response.json()) as EditorContent[K];
  }
}

export function useEditorContent<K extends keyof EditorContent>(
  section: K,
): EditorContent[K] {
  const [body, setBody] = useState<EditorContent[K]>();
  useEffect(() => {
    let active = true;
    async function load() {
      const published = await readPublishedSection(section);
      if (published) return published;
      const result = await publicClient
        ?.from("invitation_content")
        .select("body")
        .eq("section", section)
        .maybeSingle();
      return result?.data?.body as EditorContent[K] | undefined;
    }
    void load()
      .then((data) => {
        if (active && data) setBody(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [section]);
  return body ?? defaults[section];
}

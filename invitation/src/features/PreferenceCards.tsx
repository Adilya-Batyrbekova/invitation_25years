import { useLayoutEffect, useRef } from "react";
import { FormattedText } from "../components/FormattedText";
import { PhotoDeck } from "../components/PhotoDeck";
import type { IdeaCard } from "../data/ideasContent.mjs";
import { t } from "../lib/typography";

export function PreferenceCards({
  cards,
  openPhoto,
}: {
  cards: IdeaCard[];
  openPhoto: (src: string) => void;
}) {
  const grid = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const element = grid.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    element.dataset.packed = "true";
    const update = (card: HTMLElement) => {
      const height = card.offsetHeight;
      const gap = Number.parseFloat(getComputedStyle(card).marginBlockEnd) || 0;
      const rows = String(Math.max(1, Math.ceil(height + gap)));
      if (card.style.getPropertyValue("--idea-rows") !== rows) {
        card.style.setProperty("--idea-rows", rows);
      }
    };
    const observer = new ResizeObserver((entries) => {
      for (const { target } of entries) {
        if (target instanceof HTMLElement) update(target);
      }
    });
    for (const card of element.querySelectorAll<HTMLElement>(
      ":scope > article",
    )) {
      update(card);
      observer.observe(card);
    }
    return () => observer.disconnect();
  }, [cards]);

  return (
    <section className="section gift-ideas" ref={grid}>
      {cards.map((card) => {
        const gallery = card.photos.length > 0 && (
          <PhotoDeck
            title={card.title}
            label="Иллюстрация"
            photos={card.photos}
            autoplay
            onOpen={openPhoto}
          />
        );
        return (
          <article key={card.id}>
            <h2>{t(card.title)}</h2>
            {card.description && <FormattedText value={card.description} />}
            {!card.galleryAfterItems && gallery}
            {card.items.map(({ label, value, photos }, index) => {
              if (!label.trim() && !value.trim() && !photos?.length)
                return null;
              const title = label.trim() || "Подробнее";
              return (
                <details key={index}>
                  <summary>{t(title)}</summary>
                  <FormattedText value={value} />
                  {photos && photos.length > 0 && (
                    <PhotoDeck
                      title={title}
                      label="Иллюстрация"
                      photos={photos}
                      onOpen={openPhoto}
                    />
                  )}
                </details>
              );
            })}
            {card.galleryAfterItems && gallery}
          </article>
        );
      })}
    </section>
  );
}

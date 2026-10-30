import { useRef, useState } from "react";

import { t } from "../lib/typography";

export function PhotoDeck({
  title,
  label,

  photos = [
    "art/celebration.webp",
    "art/bouquet.webp",
    "art/painted-butterfly.png",
  ],
}: {
  title: string;
  label: string;
  flower?: boolean;
  photos?: string[];
}) {
  const pictures = photos.slice(0, 5);
  const [index, setIndex] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const turn = (direction: number) =>
    setIndex(
      (current) => (current + direction + pictures.length) % pictures.length,
    );
  return (
    <div
      className="photo-deck"
      role="group"
      aria-label={t("Фотографии: " + title)}
      onTouchStart={(event) => {
        const touch = event.touches[0];
        start.current = { x: touch.clientX, y: touch.clientY };
      }}
      onTouchEnd={(event) => {
        const touch = event.changedTouches[0];
        const from = start.current;
        start.current = null;
        if (
          from &&
          Math.abs(touch.clientX - from.x) > 35 &&
          Math.abs(touch.clientX - from.x) > Math.abs(touch.clientY - from.y)
        )
          turn(touch.clientX < from.x ? 1 : -1);
      }}
      onWheel={(event) => {
        if (
          Math.abs(event.deltaX) > 25 &&
          Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ) {
          const now = Date.now();
          if (now - Number(event.currentTarget.dataset.lastTurn ?? 0) > 450) {
            event.currentTarget.dataset.lastTurn = String(now);
            turn(event.deltaX > 0 ? 1 : -1);
          }
        }
      }}
    >
      <div className="photo-fan">
        {pictures.map((src, photo) => (
          <div
            className={`photo-paper ${index === photo ? "photo-front" : "photo-back"}`}
            key={photo}
            aria-hidden={index !== photo}
          >
            <div className="photo-space">
              <img
                src={src}
                alt={t(label + ` · ${photo + 1}`)}
                loading="lazy"
              />
            </div>
            <span className="photo-caption">{t(title)}</span>
          </div>
        ))}
      </div>
      <div className="photo-controls">
        {pictures.map((_, photo) => (
          <button
            key={photo}
            type="button"
            aria-label={t(`Фотография ${photo + 1} из ${pictures.length}`)}
            aria-pressed={index === photo}
            onClick={() => setIndex(photo)}
          >
            <span />
          </button>
        ))}
        <span className="sr-only" aria-live="polite">
          {t(`${index + 1} из ${pictures.length}`)}
        </span>
      </div>
    </div>
  );
}

import { t } from "../lib/typography";
export function HeroInk() {
  return (
    <div className="hero-ink">
      <img
        className="ink-art"
        src="art/celebration.webp"
        width="1400"
        height="933"
        alt={t("Лавандовый торт со свечами и букет цветов")}
        fetchPriority="high"
      />
    </div>
  );
}

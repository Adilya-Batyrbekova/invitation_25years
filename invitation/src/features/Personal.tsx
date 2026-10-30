import { useEffect, useRef, useState } from "react";
import { HandUnderline } from "../components/Art";
import { Title, P } from "../components/Text";
import { PhotoDeck } from "../components/PhotoDeck";
import { copy } from "../data/content";
import { t } from "../lib/typography";
export function Personal() {
  return (
    <>
      <section className="subpage-intro">
        <Title hero>Это всё я</Title>
        <P>{copy.personal}</P>
      </section>
      <section className="scrapbook section scroll-card-stack">
        {[
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
        ].map(([title, label, description], i) => (
          <StoryCard
            key={title}
            title={title}
            label={label}
            description={description}
            index={i}
          />
        ))}
      </section>
      <section className="preferences section">
        <Title>Маленькие предпочтения</Title>
        <div className="preference-notes">
          <p>
            {t("Люблю")}
            <span>{t("цветы с характером")}</span>
          </p>
          <p>
            {t("Могу бесконечно говорить")}
            <span>{t("о дорогих сердцу моментах")}</span>
          </p>
          <p>
            {t("Самое ценное")}
            <span>{t("люди рядом")}</span>
          </p>
        </div>
      </section>
    </>
  );
}

function StoryCard({
  title,
  label,
  description,
  index,
}: {
  title: string;
  label: string;
  description: string;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!expanded) return;
    let last = scrollY;
    const check = () => {
      const card = ref.current;
      const forward = scrollY > last;
      last = scrollY;
      if (forward && card && card.getBoundingClientRect().bottom < 0)
        setExpanded(false);
    };
    addEventListener("scroll", check, { passive: true });
    return () => removeEventListener("scroll", check);
  }, [expanded]);
  return (
    <article
      ref={ref}
      className={"scrap-entry stack-card scrap-" + index}
      data-expanded={expanded}
      data-long={description.length > 120}
    >
      <PhotoDeck title={title} label={label} />
      <div className="story">
        <h2 className="plain-heading">{t(title)}</h2>
        <p id={`story-${index}`} className="story-body">
          {t(description)}
        </p>
        {description.length > 120 && (
          <button
            type="button"
            className="story-more"
            aria-expanded={expanded}
            aria-controls={`story-${index}`}
            onClick={() => setExpanded(!expanded)}
          >
            <span className="link-label">
              {t(expanded ? "Свернуть" : "Далее")}
              <HandUnderline />
            </span>
          </button>
        )}
      </div>
    </article>
  );
}

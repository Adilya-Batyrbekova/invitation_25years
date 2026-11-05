import { useEffect, useRef, useState } from "react";
import { Title, P } from "../components/Text";
import { GuestForm } from "../components/GuestForm";
import { t } from "../lib/typography";
const examples = [
  [
    "Аня",
    "Пусть в новом году жизни будет много света, тёплых встреч и смелости для самых заветных мечтаний!",
  ],
  ["Маша", "Обнимаю! Желаю замечать маленькие радости каждый день."],
  [
    "Дима",
    "С днём рождения! Пусть рядом всегда будут люди, с которыми можно быть собой. И пусть найдётся время на все путешествия, разговоры до ночи и спонтанные приключения.",
  ],
  ["Саша", "Пусть этот день останется одним из самых тёплых воспоминаний."],
  [
    "Лена",
    "Желаю вдохновения, любимых цветов и счастливых случайностей. Пусть всё задуманное постепенно сбывается, а впереди будет ещё больше поводов улыбаться!",
  ],
  [
    "Катя",
    "Как здорово собраться вместе. С твоими прекрасными двадцатью пятью!",
  ],
  [
    "Ира",
    "Пусть дома будет уютно, в душе — спокойно, а в жизни — достаточно места для нового.",
  ],
  ["Друг", "Счастья тебе и самых добрых людей рядом!"],
];
const samples = [...examples, ...examples, ...examples];
export function Memories() {
  const feed = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(8);
  const [mobile, setMobile] = useState(
    () => matchMedia("(max-width: 767px)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(max-width: 767px)");
    const update = () => setMobile(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const container = feed.current;
    if (!container || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const card = entry.target as HTMLElement;
          if (!entry.isIntersecting || card.dataset.arrived) continue;
          card.dataset.arrived = "true";
          card.animate(
            [
              { opacity: 0, transform: "translateY(28px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 600, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
          );
          observer.unobserve(card);
        }
      },
      { threshold: 0.15 },
    );
    container
      .querySelectorAll(".wish-card")
      .forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [visible, mobile]);
  return (
    <>
      <section className="subpage-intro">
        <Title hero>На память</Title>
        <P>Оставь мне пожелание или воспоминание, которое хочется сохранить.</P>
      </section>
      <section className="memory-layout section">
        <GuestForm wish />
        <div className="memory-feed">
          <h2 className="plain-heading">{t("Ваши пожелания")}</h2>
          <div
            ref={feed}
            className="wish-cards"
            tabIndex={0}
            role="region"
            aria-label={t("Лента пожеланий")}
          >
            {samples
              .slice(0, mobile ? visible : samples.length)
              .map(([name, text], index) => (
                <article
                  className="wish-card"
                  key={index}
                  style={{ animationDelay: `${(index % 8) * 45}ms` }}
                >
                  <h3>{t(name)}</h3>
                  <p>{t(text)}</p>
                </article>
              ))}
          </div>
          {mobile && visible < samples.length && (
            <button
              className="load-wishes"
              onClick={() => setVisible(visible + 8)}
            >
              {t("Загрузить ещё")}
            </button>
          )}
        </div>
      </section>
      <section className="telegram-section section">
        <P>Фотографии и видео этого дня соберём в нашей группе в Telegram.</P>
        <button
          className="button"
          onClick={() =>
            document
              .querySelector<HTMLDialogElement>("#telegram-dialog")
              ?.showModal()
          }
        >
          {t("Открыть группу")}
        </button>
      </section>
    </>
  );
}

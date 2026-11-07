import { useEffect, useRef, useState } from "react";
import { Title, P } from "../components/Text";
import { GuestForm } from "../components/GuestForm";
import { t } from "../lib/typography";
import {
  guestResponsesEnabled,
  readWishes,
  type Wish,
} from "../data/guestResponses";
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
  const [result, setResult] =
    useState<Awaited<ReturnType<typeof readWishes>>>();
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [editing, setEditing] = useState<Wish>();
  const [visible, setVisible] = useState(8);
  const [mobile, setMobile] = useState(
    () => matchMedia("(max-width: 767px)").matches,
  );
  const limit = mobile ? visible : 24 + visible - 8;
  useEffect(() => {
    if (!guestResponsesEnabled) return;
    let active = true;
    readWishes(limit + 1).then(
      (value) => {
        if (!active) return;
        setResult(value);
        setError(false);
      },
      () => {
        if (active) setError(true);
      },
    );
    return () => {
      active = false;
    };
  }, [limit, refresh]);
  const cards = guestResponsesEnabled
    ? (result?.wishes ?? []).slice(0, limit)
    : samples.slice(0, limit).map(([name, message], index) => ({
        id: String(index),
        name,
        message,
      }));
  const hasMore = guestResponsesEnabled
    ? (result?.wishes.length ?? 0) > limit
    : mobile && visible < samples.length;
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
  }, [visible, mobile, result]);
  return (
    <>
      <section className="subpage-intro">
        <Title hero>На память</Title>
        <P>Оставь мне пожелание или воспоминание, которое хочется сохранить.</P>
      </section>
      <section className="memory-layout section">
        <div>
          <GuestForm wish onSaved={() => setRefresh((value) => value + 1)} />
        </div>
        <div className="memory-feed">
          <h2 className="plain-heading">{t("Ваши пожелания")}</h2>
          {guestResponsesEnabled && !result && !error && (
            <p role="status">{t("Загружаем пожелания…")}</p>
          )}
          {error && (
            <p role="status">
              {t("Не получилось загрузить пожелания.")}{" "}
              <button
                className="load-wishes"
                onClick={() => setRefresh((value) => value + 1)}
              >
                {t("Повторить")}
              </button>
            </p>
          )}
          {result?.wishes.length === 0 && <P>Здесь появятся ваши пожелания.</P>}
          <div
            ref={feed}
            className="wish-cards"
            tabIndex={0}
            role="region"
            aria-label={t("Лента пожеланий")}
          >
            {cards.map((card, index) => (
              <article
                className="wish-card"
                key={card.id}
                style={{ animationDelay: `${(index % 8) * 45}ms` }}
              >
                <h3>{t(card.name)}</h3>
                <p>{t(card.message)}</p>
                {result?.ownIds.has(card.id) && editing?.id !== card.id && (
                  <button className="button" onClick={() => setEditing(card)}>
                    {t("Исправить пожелание")}
                  </button>
                )}
                {editing?.id === card.id && (
                  <>
                    <GuestForm
                      wish
                      editing={editing}
                      onSaved={() => {
                        setEditing(undefined);
                        setRefresh((value) => value + 1);
                      }}
                    />
                    <button
                      className="button"
                      onClick={() => setEditing(undefined)}
                    >
                      {t("Отмена")}
                    </button>
                  </>
                )}
              </article>
            ))}
          </div>
          {hasMore && (
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

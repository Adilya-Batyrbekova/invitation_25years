import { useEffect, useState } from "react";
import { Title, P } from "../components/Text";
import { GuestForm } from "../components/GuestForm";
import { t } from "../lib/typography";
const examples = [
  [
    "Аня · пример",
    "Пусть в новом году жизни будет много света, тёплых встреч и смелости для самых заветных мечтаний!",
  ],
  ["Маша · пример", "Обнимаю! Желаю замечать маленькие радости каждый день."],
  [
    "Дима · пример",
    "С днём рождения! Пусть рядом всегда будут люди, с которыми можно быть собой. И пусть найдётся время на все путешествия, разговоры до ночи и спонтанные приключения.",
  ],
  [
    "Саша · пример",
    "Пусть этот день останется одним из самых тёплых воспоминаний.",
  ],
  [
    "Лена · пример",
    "Желаю вдохновения, любимых цветов и счастливых случайностей. Пусть всё задуманное постепенно сбывается, а впереди будет ещё больше поводов улыбаться!",
  ],
  [
    "Катя · пример",
    "Как здорово собраться вместе. С твоими прекрасными двадцатью пятью!",
  ],
  [
    "Ира · пример",
    "Пусть дома будет уютно, в душе — спокойно, а в жизни — достаточно места для нового.",
  ],
  ["Друг · пример", "Счастья тебе и самых добрых людей рядом!"],
];
const samples = [...examples, ...examples, ...examples];
export function Memories() {
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

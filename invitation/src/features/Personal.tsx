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
          [
            "Моменты рядом",
            "Кадр на память",
            "Люблю фотографии, к которым хочется возвращаться.",
          ],
        ].map(([title, label, description], i) => (
          <article key={title} className={"scrap-entry stack-card scrap-" + i}>
            <PhotoDeck title={title} label={label} autoplay />
            <div className="story">
              <h2 className="plain-heading">{t(title)}</h2>
              <P className="story-body">{description}</P>
            </div>
          </article>
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

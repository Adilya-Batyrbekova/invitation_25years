import { Title, P } from "../components/Text";
import { Doodle } from "../components/Art";
import { copy } from "../data/content";
import { t } from "../lib/typography";
export function Personal() {
  return (
    <>
      <section className="subpage-intro">
        <Doodle />
        <Title hero>Это всё я</Title>
        <P>{copy.personal}</P>
      </section>
      <section className="scrapbook section">
        {[
          [
            "Маленькая я",
            "Фотография из детства",
            "У каждой истории есть начало. Здесь будет один из первых кадров моей.",
          ],
          [
            "Один счастливый день",
            "Недавняя фотография",
            "Есть моменты, которые хочется сохранить не только в телефоне.",
          ],
          [
            "Маленькие радости",
            "Любимая вещь",
            "Самое дорогое не всегда большое. Иногда это вещь, у которой есть своя история.",
          ],
        ].map(([title, label, description], i) => (
          <article className={"scrap-entry scrap-" + i} key={title}>
            <div className="photo-paper reveal">
              <div className="photo-space">
                <Doodle kind={i === 1 ? "flower" : "heart"} />
                <span>{t(label)}</span>
              </div>
              <span className="photo-caption">{t(title)}</span>
            </div>
            <div className="story">
              <Title>{title}</Title>
              <P>{description}</P>
              <details>
                <summary>{t("Ещё немного об этом")}</summary>
                <P>
                  Некоторые истории лучше всего рассказывать за чашкой чая.
                  Будет здорово вспомнить их вместе.
                </P>
              </details>
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

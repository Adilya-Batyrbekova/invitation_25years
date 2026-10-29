import { Title, P, Words } from "../components/Text";
import { Doodle } from "../components/Art";
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
          <article className={"scrap-entry stack-card scrap-" + i} key={title}>
            <div className="photo-paper reveal">
              <div className="photo-space">
                <Doodle kind={i === 1 ? "flower" : "heart"} />
                <span>{t(label)}</span>
              </div>
              <span className="photo-caption">{t(title)}</span>
            </div>
            <div className="story">
              <h2 className="plain-heading">{t(title)}</h2>
              <P>{description}</P>
            </div>
          </article>
        ))}
      </section>
      <section className="preferences section">
        <Title>Маленькие предпочтения</Title>
        <div className="preference-notes">
          <p>
            <Words>Люблю</Words>
            <span>
              <Words>цветы с характером</Words>
            </span>
          </p>
          <p>
            <Words>Могу бесконечно говорить</Words>
            <span>
              <Words>о дорогих сердцу моментах</Words>
            </span>
          </p>
          <p>
            <Words>Самое ценное</Words>
            <span>
              <Words>люди рядом</Words>
            </span>
          </p>
        </div>
      </section>
    </>
  );
}

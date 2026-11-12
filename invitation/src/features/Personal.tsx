import { Title, P } from "../components/Text";
import { FormattedText } from "../components/FormattedText";
import { PhotoDeck } from "../components/PhotoDeck";
import { useEditorContent } from "../data/editorContent";
import { t } from "../lib/typography";
export function Personal() {
  const content = useEditorContent("personal");
  return (
    <>
      <section className="subpage-intro">
        <Title hero>Это всё я</Title>
        <P>{content.intro}</P>
      </section>
      <section className="scrapbook section scroll-card-stack">
        {content.stories.map(({ id, title, label, description, photos }, i) => (
          <article key={id} className={"scrap-entry stack-card scrap-" + i}>
            {photos?.length !== 0 && (
              <PhotoDeck title={title} label={label} photos={photos} autoplay />
            )}
            <div className="story">
              <h2 className="plain-heading">{t(title)}</h2>
              <FormattedText className="story-body" value={description} />
            </div>
          </article>
        ))}
      </section>
      <section className="preferences section">
        <Title>Маленькие предпочтения</Title>
        <div className="preference-notes">
          {content.preferences.map(({ label, value }, index) => (
            <p key={index}>
              {t(label)}
              <span>{t(value)}</span>
            </p>
          ))}
        </div>
      </section>
    </>
  );
}

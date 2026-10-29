import { Title, P } from "../components/Text";
import { GuestForm } from "../components/GuestForm";
import { t } from "../lib/typography";
export function Memories() {
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
          <div className="wish-cards scroll-card-stack">
            <div className="empty-wishes">
              <P>Здесь появятся ваши слова.</P>
            </div>
          </div>
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

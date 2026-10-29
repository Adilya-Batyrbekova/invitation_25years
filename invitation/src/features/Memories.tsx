import { PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { Title, P } from "../components/Text";
import { Doodle } from "../components/Art";
import { GuestForm } from "../components/GuestForm";
import { copy } from "../data/content";
import { t } from "../lib/typography";
export function Memories() {
  return (
    <>
      <section className="subpage-intro">
        <Doodle kind="heart" />
        <Title hero>На память</Title>
        <P>{copy.memory}</P>
      </section>
      <section className="memory-write section">
        <div>
          <Title>Твоя открытка</Title>
          <P>
            Напиши пожелание, смешное воспоминание или просто пару тёплых слов.
          </P>
          <Doodle className="memory-star float-art" />
        </div>
        <GuestForm wish />
      </section>
      <section className="memory-feed section">
        <Title>Воспоминания</Title>
        <div className="empty-wishes reveal">
          <Doodle kind="flower" />
          <P>Пока здесь нет записей</P>
        </div>
      </section>
      <section className="telegram-section section">
        <div className="telegram-art float-art" aria-hidden="true">
          <PaperPlaneTiltIcon weight="thin" />
        </div>
        <div>
          <Title>Наши фотографии</Title>
          <P>
            Соберём этот день в один альбом. Фотографии и видео встречи — в
            нашей группе в Telegram.
          </P>
          <button
            className="button"
            onClick={() =>
              document
                .querySelector<HTMLDialogElement>("#telegram-dialog")
                ?.showModal()
            }
          >
            <PaperPlaneTiltIcon size={24} />
            {t("Открыть группу")}
          </button>
        </div>
      </section>
    </>
  );
}

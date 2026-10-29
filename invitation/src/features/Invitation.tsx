import {
  ArrowRightIcon,
  MapPinIcon,
  ChatCircleDotsIcon,
} from "@phosphor-icons/react";
import { Title, P } from "../components/Text";
import { Doodle, Garland } from "../components/Art";
import { GuestForm } from "../components/GuestForm";
import { copy } from "../data/content";
import { t } from "../lib/typography";
import { HeroInk } from "../components/HeroInk";
export function Invitation() {
  return (
    <>
      <section className="hero">
        <Garland />
        <div className="hero-copy">
          <Doodle kind="heart" className="hero-heart" />
          <Title hero>Мне 25!</Title>
          <p className="hero-subtitle">{t("Приходи на день рождения")}</p>
          <p className="paint-date">{t("28 ноября 2026")}</p>
        </div>
        <div className="hero-art float-art">
          <HeroInk />
        </div>
        <Doodle className="hero-star" />
        <span className="flying-butterfly" aria-hidden="true">
          <i />
          <i />
        </span>
      </section>
      <section className="greeting section">
        <div>
          <Title>{copy.greeting}</Title>
          <P className="reveal">{copy.greetingBody}</P>
        </div>
        <div className="greeting-note reveal">
          <Doodle kind="heart" />
          <span>{t("Этот день — про нас")}</span>
        </div>
      </section>
      <section className="date-section section">
        <div className="date-intro">
          <Title>Встречаемся 28 ноября</Title>
          <p className="time-note reveal">{t("С 14:00 до 18:00")}</p>
          <P className="reveal">
            Побудем вместе в домашней атмосфере — без строгой программы.
          </P>
          <Doodle kind="flower" className="date-flower float-art" />
        </div>
        <div className="calendar-wrap">
          <div className="calendar-paper">
            <div className="calendar-binding" aria-hidden="true">
              <i />
              <i />
            </div>
            <p className="calendar-month">
              {t("Ноябрь")} <span>2026</span>
            </p>
            <div
              className="calendar"
              role="table"
              aria-label={t("Ноябрь 2026, праздник в субботу 28 ноября")}
            >
              <div className="calendar-row" role="row">
                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
                  <span role="columnheader" key={d}>
                    {t(d)}
                  </span>
                ))}
              </div>
              {Array.from({ length: 6 }, (_, row) => (
                <div className="calendar-row" role="row" key={row}>
                  {Array.from({ length: 7 }, (_, col) => {
                    const day = row * 7 + col - 5;
                    return (
                      <span
                        role="cell"
                        key={col}
                        className={day === 28 ? "selected-date" : ""}
                      >
                        {day > 0 && day <= 30 ? day : ""}
                        {day === 28 && (
                          <svg viewBox="0 0 70 65" aria-hidden="true">
                            <path
                              className="date-circle"
                              d="M54 12C28-4 5 13 8 35C11 63 55 62 62 35C66 14 36 2 18 13"
                            />
                          </svg>
                        )}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
            <span className="calendar-caption">{t("Обведи этот день ♡")}</span>
          </div>
        </div>
      </section>
      <section className="venue section">
        <div className="door-art float-art" aria-hidden="true">
          <div className="door-frame">
            <div className="door-leaf">
              <Doodle kind="heart" />
              <i />
            </div>
          </div>
          <Doodle kind="flower" className="door-flower" />
          <Doodle className="door-star" />
        </div>
        <div className="venue-copy">
          <Title>Где встречаемся</Title>
          <p className="address reveal">{t("Астана, Абая, 88")}</p>
          <P className="reveal">Здание церкви</P>
          <P className="reveal">
            Дресс-кода нет — приходи так, как тебе удобно.
          </P>
          <a
            className="button reveal"
            href="https://2gis.kz/astana/search/Абая%2088"
            target="_blank"
            rel="noreferrer"
          >
            <MapPinIcon size={23} />
            {t("Открыть маршрут")}
          </a>
        </div>
      </section>
      <section className="rsvp section">
        <div>
          <Title>Ты придёшь?</Title>
          <P className="reveal">
            Напиши своё имя и дай знать, получится ли у тебя присоединиться.
          </P>
          <Doodle kind="heart" className="rsvp-heart" />
        </div>
        <div className="reveal">
          <GuestForm />
        </div>
      </section>
      <section className="flowers section" id="gifts" tabIndex={-1}>
        <div className="bouquet float-art">
          <img
            className="ink-art"
            loading="lazy"
            src="art/bouquet.webp"
            width="1120"
            height="1344"
            alt={t(
              "Букет жёлтых, голубых и лавандовых цветов в фиолетовой вазе",
            )}
          />
        </div>
        <div className="flower-copy">
          <Title>Один цветок от тебя</Title>
          <P className="reveal">{copy.flower}</P>
          <P className="reveal">{copy.flowerMore}</P>
          <p className="important reveal">{t("Самое главное — приходи.")}</p>
          <P className="reveal">{copy.important}</P>
          <P className="reveal">{copy.wishlist}</P>
          <a className="text-link" href="#/wishlist">
            {t("Посмотреть вишлист")}
            <ArrowRightIcon />
          </a>
        </div>
      </section>
      <section className="personal-links section" id="personal" tabIndex={-1}>
        <div>
          <Title>Ещё немного личного</Title>
          <P>
            Здесь можно узнать обо мне что-нибудь новое или оставить нам
            воспоминание об этом дне.
          </P>
        </div>
        <div className="paper-links">
          <a href="#/personal" className="paper-link lilac reveal">
            <Doodle />
            {t("Это всё я")}
            <ArrowRightIcon />
          </a>
          <a href="#/memories" className="paper-link yellow reveal">
            <Doodle kind="flower" />
            {t("На память")}
            <ArrowRightIcon />
          </a>
        </div>
      </section>
      <section className="contact section">
        <Title>Если захочешь что-нибудь уточнить — напиши мне</Title>
        <button
          className="button"
          onClick={() =>
            document
              .querySelector<HTMLDialogElement>("#contact-dialog")
              ?.showModal()
          }
        >
          <ChatCircleDotsIcon size={24} />
          {t("Написать мне")}
        </button>
        <Garland bottom />
      </section>
    </>
  );
}

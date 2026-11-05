import { MapPinIcon } from "@phosphor-icons/react";
import { Title, P, Words } from "../components/Text";
import {
  Doodle,
  Garland,
  HandArrow,
  HandUnderline,
  RsvpSurface,
  Butterfly,
} from "../components/Art";
import { GuestForm } from "../components/GuestForm";
import { copy } from "../data/content";
import { t } from "../lib/typography";
import { LivingArt } from "../components/LivingArt";
import { HeroInk } from "../components/HeroInk";
export function Invitation() {
  return (
    <>
      <section className="hero">
        <Garland />
        <div className="hero-copy">
          <Doodle kind="heart" className="hero-heart" />
          <Title hero>Мне 25!</Title>
          <p className="hero-subtitle">
            <Words>Приходи на день рождения</Words>
          </p>
          <p className="paint-date">{t("28 ноября 2026")}</p>
        </div>
        <div className="hero-art float-art">
          <HeroInk />
        </div>
        <Doodle className="hero-star" />
        <Butterfly />
      </section>
      <div className="venue-rsvp-stack scroll-card-stack">
        <section className="venue section stack-card">
          <Butterfly className="butterfly-calendar" />
          <div className="meeting-papers">
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
                                  d="M35 5C17 5 5 17 5 33S18 59 35 59S65 47 65 33S53 5 35 5"
                                />
                              </svg>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="address-note float-art">
              <span>{t("Увидимся здесь")}</span>
              <strong>{t("Абая, 89")}</strong>
              <small>{t("Большой зал")}</small>
            </div>
          </div>
          <div className="venue-copy">
            <Title>Встречаемся здесь</Title>
            <P className="meeting-date">28 ноября 2026</P>
            <P className="time-note">С 14:00 до 18:00</P>
            <P className="reveal">
              Моё пожелание — светлый, желательно однотонный верх.
            </P>
            <a
              className="button reveal"
              href="https://2gis.kz/astana/search/Абая%2089"
              target="_blank"
              rel="noreferrer"
            >
              <MapPinIcon size={23} />
              {t("Открыть маршрут")}
            </a>
          </div>
        </section>
        <section className="rsvp section stack-card">
          <RsvpSurface />
          <div>
            <div className="rsvp-heading">
              <Title>Ты придёшь?</Title>
              <Doodle kind="heart" className="rsvp-heart" />
            </div>
            <P className="reveal">
              Напиши своё имя и дай знать до 24 ноября, получится ли у тебя
              присоединиться.
            </P>
          </div>
          <div className="reveal">
            <GuestForm />
          </div>
        </section>
      </div>
      <section className="flowers section" id="gifts" tabIndex={-1}>
        <Butterfly className="butterfly-flowers" />
        <div className="bouquet">
          <div className="bouquet-drift">
            <LivingArt />
          </div>
        </div>
        <div className="flower-copy">
          <Title>Один цветок от тебя</Title>
          <P>{copy.flower}</P>
          <P>{copy.flowerMore}</P>
          <div className="heart-note">
            <Doodle kind="heart" />
            <P>Самое главное — приходи. Даже без цветка и подарка.</P>
          </div>
          <P className="wishlist-copy">
            <Words>А если хочется подарить что-то ещё, вот мой</Words>{" "}
            <a className="inline-wishlist" href="#/wishlist">
              <span className="link-label">
                <Words>вишлист</Words>
                <HandUnderline />
              </span>
            </a>
            <Words>. Никаких обязательств.</Words>
          </P>
        </div>
      </section>
      <section className="personal-links section" id="personal" tabIndex={-1}>
        <Butterfly className="butterfly-personal" />
        <div>
          <Title>Ещё немного личного</Title>
          <P>
            Здесь можно узнать обо мне что-нибудь новое или оставить нам
            воспоминание об этом дне.
          </P>
        </div>
        <div className="paper-links float-art">
          <a href="#/personal" className="paper-link lilac reveal">
            <Doodle />
            <span className="link-label">
              {t("Это всё я")}
              <HandUnderline />
            </span>
            <HandArrow />
          </a>
          <a href="#/memories" className="paper-link yellow reveal">
            <Doodle kind="flower" />
            <span className="link-label">
              {t("На память")}
              <HandUnderline />
            </span>
            <HandArrow />
          </a>
        </div>
      </section>
      <section className="contact section">
        <Butterfly className="butterfly-contact" />
        <a
          className="contact-link"
          href="https://t.me/ADelhi"
          target="_blank"
          rel="noreferrer"
        >
          <span className="link-label">
            {t("Связаться со мной")}
            <HandUnderline />
          </span>
          <HandArrow />
        </a>
      </section>
    </>
  );
}

import { SendFlight } from "../components/SendFlight";
import { PhotoDeck } from "../components/PhotoDeck";
import { SlidersHorizontalIcon, ArrowsDownUpIcon } from "@phosphor-icons/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CaretDownIcon, XIcon } from "@phosphor-icons/react";
import { P } from "../components/Text";
import { GiftArt } from "../components/Art";
import { filterGifts, gifts, type Gift } from "../data/content";
import { submitDraft } from "../data/submissions";
import { t } from "../lib/typography";

function ShopLink({ gift }: { gift: Gift }) {
  return gift.shop ? (
    <a
      className="button shop-link"
      href={gift.shop.url}
      target="_blank"
      rel="noreferrer"
    >
      {t("В магазин")}
    </a>
  ) : (
    <button
      type="button"
      className="button shop-link"
      disabled
      title={t("Ссылка на магазин пока не добавлена")}
    >
      {t("В магазин")}
    </button>
  );
}
export function ReserveButton({
  gift,
  expanded,
  controls,
  onClick,
}: {
  gift: Gift;
  expanded: boolean;
  controls: string;
  onClick: () => void;
}) {
  const available = gift.availability === "available";
  return (
    <button
      type="button"
      className={"button " + (available ? "filled" : "unavailable")}
      disabled={!available}
      aria-expanded={available ? expanded : undefined}
      aria-controls={available ? controls : undefined}
      onClick={onClick}
    >
      {t(
        available
          ? "Забронировать"
          : gift.availability === "own"
            ? "Твоя бронь"
            : "Забронировано",
      )}
    </button>
  );
}
function ReservationForm({ gift }: { gift: Gift }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="reservation-form"
      autoComplete="off"
      aria-label={t("Бронирование: " + gift.name)}
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        setError("");
        try {
          await submitDraft();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy && <SendFlight />}
      <input
        autoFocus
        required
        maxLength={60}
        name="giver"
        aria-label={t("Твоё имя")}
        placeholder={t("Твоё имя")}
        autoComplete="off"
      />
      <button
        className="button filled send-button"
        type="submit"
        disabled={busy}
        aria-busy={busy}
      >
        {t(busy ? "Бронируем…" : "Подтвердить")}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path d="M3 10 21 3l-6 18-4-7-8-4Zm8 4L21 3" />
        </svg>
      </button>
      {error && (
        <p role="alert" className="form-error">
          {t(error)}
        </p>
      )}
    </form>
  );
}
export function GiftGallery({ gift }: { gift: Gift }) {
  const [index, setIndex] = useState(0);
  const images = gift.images ?? [];
  const photo = images[index];
  return (
    <div className="gift-gallery">
      <div className="dialog-picture">
        {photo ? (
          <img src={photo.src} alt={t(photo.alt)} />
        ) : (
          <GiftArt shape={gift.shape} />
        )}
      </div>
      {images.length > 1 && (
        <div className="gallery-controls" aria-label={t("Фотографии подарка")}>
          {images.map((photo, i) => (
            <button
              type="button"
              key={photo.src}
              aria-label={t(`Фотография ${i + 1} из ${images.length}`)}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export function Wishlist() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ideaImage, setIdeaImage] = useState("");
  const interior = useRef<HTMLDivElement>(null);
  const ideaDialog = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState<"ideas" | "gifts">("gifts");
  const [category, setCategory] = useState<string[]>([]);
  const [budget, setBudget] = useState(Infinity);
  const [minimum, setMinimum] = useState(0);
  const [sort, setSort] = useState("name");
  const [currency, setCurrency] = useState("KZT");
  const [selected, setSelected] = useState<Gift | null>(null);
  const [reserving, setReserving] = useState<number | null>(null);
  const [dialogReserving, setDialogReserving] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  // Share only the closed content height. An inline reservation stays outside this layout.
  useLayoutEffect(() => {
    const root = grid.current;
    if (!root) return;
    let lastHeight = 0;
    const measure = () => {
      const layouts = [...root.querySelectorAll<HTMLElement>(".gift-layout")];
      const height = Math.ceil(
        Math.max(
          0,
          ...layouts.map((layout) => {
            const picture = layout.querySelector<HTMLElement>(".gift-picture")!;
            const info = layout.querySelector<HTMLElement>(".gift-info")!;
            const actions = layout.querySelector<HTMLElement>(".gift-actions")!;
            return (
              Math.max(
                picture.offsetHeight,
                [...info.children].reduce((sum, child) => {
                  const item = child as HTMLElement;
                  const style = getComputedStyle(item);
                  return (
                    sum +
                    item.offsetHeight +
                    parseFloat(style.marginTop) +
                    parseFloat(style.marginBottom)
                  );
                }, 0) +
                  parseFloat(getComputedStyle(info).rowGap) *
                    Math.max(0, info.children.length - 1),
              ) +
              actions.offsetHeight +
              parseFloat(getComputedStyle(layout).rowGap)
            );
          }),
        ),
      );
      if (height !== lastHeight) {
        lastHeight = height;
        root.style.setProperty("--gift-body-height", height + "px");
      }
    };
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    root
      .querySelectorAll(".gift-picture,.gift-info,.gift-info > *,.gift-actions")
      .forEach((el) => observer.observe(el));
    measure();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [category, budget, minimum, sort, view]);
  const priceLimit = Math.max(
    1000,
    Math.ceil(Math.max(...gifts.map((gift) => gift.price)) / 1000) * 1000,
  );
  const maximum = Math.min(budget, priceLimit);
  useEffect(() => {
    const scope = (grid.current ?? interior.current)?.closest("main");
    if (!scope || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const cards = [
      ...scope.querySelectorAll<HTMLElement>(
        view === "gifts" ? ".gift-layout" : ".gift-ideas article",
      ),
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, intersectionRatio } of entries) {
          if (intersectionRatio >= 0.12)
            target.animate(
              [
                { opacity: 0.12, transform: "translateY(24px)" },
                { opacity: 1, transform: "none" },
              ],
              { duration: 520, easing: "ease-out" },
            );
        }
      },
      { threshold: 0.12 },
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [category, budget, minimum, sort, view]);
  const [ideaSlide, setIdeaSlide] = useState(0);
  const ideaPictures = [
    "art/bouquet.webp",
    "art/celebration.webp",
    "art/painted-butterfly.png",
  ];
  useEffect(() => {
    const track = interior.current;
    if (view !== "ideas" || !track) return;
    const timer = window.setInterval(() => {
      const bounds = track.getBoundingClientRect();
      if (
        document.hidden ||
        matchMedia("(prefers-reduced-motion: reduce)").matches ||
        track.matches(":hover, :focus-within") ||
        bounds.bottom < 0 ||
        bounds.top > innerHeight
      )
        return;
      const next = (Math.round(track.scrollLeft / track.clientWidth) + 1) % 3;
      track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
    }, 3000);
    return () => window.clearInterval(timer);
  }, [view]);
  const shown = filterGifts(category, budget, sort, minimum);
  const price = (n: number) => t(n.toLocaleString("ru-RU") + " ₸");
  return (
    <>
      <section className="subpage-intro">
        <div
          className="wishlist-views"
          role="group"
          aria-label={t("Разделы подарков")}
        >
          <button
            type="button"
            aria-pressed={view === "ideas"}
            onClick={() => setView("ideas")}
          >
            {t("Что мне нравится")}
          </button>
          <button
            type="button"
            aria-pressed={view === "gifts"}
            onClick={() => setView("gifts")}
          >
            {t("Вишлист")}
          </button>
        </div>
        <h1 className="wishlist-heading">
          {t(view === "ideas" ? "Что мне нравится" : "Вишлист")}
        </h1>
        <p>
          {t(
            view === "ideas"
              ? "Идеи, от которых можно оттолкнуться, если хочется выбрать подарок самостоятельно."
              : "Если сложно выбрать подарок, здесь собраны готовые идеи. Самое главное — приходи.",
          )}
        </p>
      </section>
      {view === "ideas" && (
        <section className="section gift-ideas">
          <article className="idea-interior">
            <h2>{t("Интерьер с характером")}</h2>
            <p>
              {t(
                "Необычные ковры, яркое постельное бельё и картинки, которые хочется повесить дома.",
              )}
            </p>
            <div
              className="idea-collage"
              ref={interior}
              onScroll={(event) => {
                const track = event.currentTarget;
                setIdeaSlide(Math.round(track.scrollLeft / track.clientWidth));
              }}
            >
              {ideaPictures.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  aria-label={t(`Увеличить иллюстрацию ${index + 1}`)}
                  onClick={() => {
                    setIdeaImage(src);
                    ideaDialog.current?.showModal();
                  }}
                >
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
            <div className="photo-controls">
              {ideaPictures.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  aria-label={t(`Иллюстрация ${index + 1}`)}
                  aria-pressed={ideaSlide === index}
                  onClick={() => {
                    const track = interior.current;
                    if (track)
                      track.scrollTo({ left: track.clientWidth * index });
                  }}
                >
                  <span />
                </button>
              ))}
            </div>
          </article>
          <article>
            <h2>{t("Книжная полка")}</h2>
            <details>
              <summary>{t("Книги и авторы")}</summary>
              <p>
                {t(
                  "Книги, к которым хочется возвращаться, и истории, которые ещё только предстоит открыть.",
                )}
              </p>
            </details>
            <details>
              <summary>{t("Издательства и оформление")}</summary>
              <p>
                {t(
                  "Особенно интересно, когда оформление обложки передаёт настроение книги.",
                )}
              </p>
            </details>
          </article>
          <article>
            <h2>{t("Коллекция кружек")}</h2>
            <p>
              {t("Кружки необычной формы, с интересной ручкой или рисунком.")}
            </p>
            <PhotoDeck title="Коллекция кружек" label="Иллюстрация" autoplay />
          </article>
        </section>
      )}
      <section className="wishlist-content section" hidden={view !== "gifts"}>
        <div
          className="gift-categories"
          role="group"
          aria-label={t("Категория")}
        >
          {["Все", "Книги", "Для дома", "Впечатления", "Творчество"].map(
            (name) => (
              <button
                key={name}
                aria-label={t(name)}
                type="button"
                aria-pressed={
                  name === "Все" ? !category.length : category.includes(name)
                }
                onClick={() =>
                  setCategory((current) =>
                    name === "Все"
                      ? []
                      : current.includes(name)
                        ? current.filter((item) => item !== name)
                        : [...current, name],
                  )
                }
              >
                {t(name)}
              </button>
            ),
          )}
        </div>
        <div className="gift-tools">
          <details className="gift-sort">
            <summary>
              <ArrowsDownUpIcon size={18} aria-hidden="true" />
              {t(
                sort === "cheap"
                  ? "По возрастанию цены"
                  : sort === "expensive"
                    ? "По убыванию цены"
                    : "По названию",
              )}
            </summary>
            <div>
              {[
                ["name", "По названию"],
                ["cheap", "По возрастанию цены"],
                ["expensive", "По убыванию цены"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={value === sort}
                  onClick={(event) => {
                    setSort(value);
                    const menu = event.currentTarget.closest("details");
                    if (menu) {
                      menu.open = false;
                      menu.querySelector("summary")?.focus();
                    }
                  }}
                >
                  {t(label)}
                </button>
              ))}
            </div>
          </details>
          <button
            type="button"
            aria-label={t("Фильтры")}
            className="button filter-toggle"
            aria-expanded={filtersOpen}
            aria-controls="gift-filters"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <SlidersHorizontalIcon size={20} aria-hidden="true" />
          </button>
        </div>
        <div
          id="gift-filters"
          data-open={filtersOpen}
          className="gift-settings"
          role="region"
          aria-label={t("Фильтры подарков")}
        >
          <div className="filter-fields">
            <fieldset className="gift-currency">
              <legend>{t("Валюта")}</legend>
              <label>
                <input
                  type="radio"
                  name="currency"
                  checked={currency === "KZT"}
                  onChange={() => setCurrency("KZT")}
                />
                {t("Тенге")}
              </label>
              <label>
                <input
                  type="radio"
                  name="currency"
                  checked={currency === "RUB"}
                  onChange={() => setCurrency("RUB")}
                />
                {t("Рубли")}
              </label>
            </fieldset>
            <div className="budget-range">
              <div className="budget-values">
                <span>
                  {t("Бюджет от")} {price(minimum)}
                </span>
                <span>
                  {t("до")} {price(maximum)}
                </span>
              </div>
              <div
                className="budget-track"
                style={{
                  backgroundImage: `linear-gradient(to right, #e5d8e8 ${(minimum / priceLimit) * 100}%, var(--plum) ${(minimum / priceLimit) * 100}%, var(--plum) ${(maximum / priceLimit) * 100}%, #e5d8e8 ${(maximum / priceLimit) * 100}%)`,
                }}
              >
                <input
                  type="range"
                  aria-label={t("Бюджет от")}
                  min={0}
                  max={priceLimit}
                  step={100}
                  value={minimum}
                  onChange={(event) =>
                    setMinimum(Math.min(Number(event.target.value), maximum))
                  }
                />

                <input
                  type="range"
                  aria-label={t("Бюджет до")}
                  min={0}
                  max={priceLimit}
                  step={100}
                  value={maximum}
                  onChange={(event) =>
                    setBudget(Math.max(Number(event.target.value), minimum))
                  }
                />
              </div>
            </div>
            <button
              type="button"
              className="filter-reset"
              onClick={() => {
                setCategory([]);
                setBudget(Infinity);
                setMinimum(0);
                setCurrency("KZT");
              }}
            >
              {t("Сбросить")}
            </button>
          </div>
          {currency === "RUB" && (
            <P className="small currency-note">
              Пока показываем цены в тенге — курс для пересчёта недоступен.
            </P>
          )}
        </div>
        <div className="gift-grid" ref={grid}>
          {shown.map((g) => (
            <article className="gift-card" key={g.id}>
              <button
                className="gift-open"
                aria-label={t("Подробнее: " + g.name)}
                onClick={() => {
                  setSelected(g);
                  setDialogReserving(false);
                  dialog.current?.showModal();
                }}
              />
              <div className="gift-layout">
                <div className="gift-picture">
                  {g.images?.[0] ? (
                    <img
                      src={g.images[0].src}
                      alt={t(g.images[0].alt)}
                      loading="lazy"
                    />
                  ) : (
                    <GiftArt shape={g.shape} />
                  )}
                </div>
                <div className="gift-info">
                  <h2 className="gift-name">{t(g.name)}</h2>
                  <p className="gift-description">{t(g.description)}</p>
                  <p className="gift-price">{price(g.price)}</p>
                </div>
                <div className="gift-actions">
                  <ShopLink gift={g} />
                  <ReserveButton
                    gift={g}
                    expanded={reserving === g.id}
                    controls={"reserve-" + g.id}
                    onClick={() =>
                      setReserving(reserving === g.id ? null : g.id)
                    }
                  />
                </div>
              </div>
              <div
                className="inline-reservation"
                id={"reserve-" + g.id}
                hidden={reserving !== g.id}
              >
                {reserving === g.id && <ReservationForm gift={g} />}
              </div>
            </article>
          ))}
        </div>
        {!shown.length && (
          <P>
            По этим фильтрам подарков нет. Попробуй выбрать другой бюджет или
            категорию.
          </P>
        )}
      </section>
      <dialog
        ref={ideaDialog}
        className="idea-lightbox"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        aria-label={t("Иллюстрация крупным планом")}
      >
        <form method="dialog">
          <button className="idea-close" aria-label={t("Закрыть")}>
            <XIcon size={20} />
          </button>
        </form>
        {ideaImage && <img src={ideaImage} alt={t("Иллюстрация")} />}
      </dialog>
      <dialog
        ref={dialog}
        className="gift-dialog"
        aria-label={selected ? t(selected.name) : undefined}
        onClose={() => setDialogReserving(false)}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        <button
          className="close-dialog"
          aria-label={t("Закрыть")}
          onClick={() => dialog.current?.close()}
        >
          <XIcon size={25} />
        </button>
        {selected && (
          <>
            <GiftGallery gift={selected} key={selected.id} />
            <div className="dialog-copy">
              <h2>{t(selected.name)}</h2>
              <P>{selected.description}</P>
              <p className="dialog-price">{price(selected.price)}</p>
              {selected.note && (
                <details className="gift-note">
                  <summary>
                    {t("Подробнее")}
                    <CaretDownIcon size={20} />
                  </summary>
                  <P>{selected.note}</P>
                </details>
              )}
              {selected.shop && (
                <P className="shop-name">{selected.shop.name}</P>
              )}
              <div className="gift-actions">
                <ShopLink gift={selected} />
                <ReserveButton
                  gift={selected}
                  expanded={dialogReserving}
                  controls="dialog-reservation"
                  onClick={() => setDialogReserving(!dialogReserving)}
                />
              </div>
              <div id="dialog-reservation" hidden={!dialogReserving}>
                {dialogReserving && (
                  <ReservationForm gift={selected} key={selected.id} />
                )}
              </div>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}

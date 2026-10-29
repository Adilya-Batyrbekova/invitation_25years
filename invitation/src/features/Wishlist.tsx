import { useLayoutEffect, useRef, useState } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  CaretDownIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Title, P } from "../components/Text";
import { GiftArt } from "../components/Art";
import { filterGifts, type Gift } from "../data/content";
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
      <input
        autoFocus
        required
        maxLength={60}
        name="giver"
        aria-label={t("Твоё имя")}
        placeholder={t("Твоё имя")}
        autoComplete="given-name"
      />
      <button className="button filled" disabled={busy}>
        {t(busy ? "Бронируем…" : "Подтвердить бронь")}
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
  const [category, setCategory] = useState("Все");
  const [budget, setBudget] = useState(Infinity);
  const [minimum, setMinimum] = useState(0);
  const [sort, setSort] = useState("default");
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
  }, [category, budget, minimum, sort]);
  const shown = filterGifts(category, budget, sort, minimum);
  const price = (n: number) => t(n.toLocaleString("ru-RU") + " ₸");
  return (
    <>
      <section className="subpage-intro">
        <Title hero>Вишлист</Title>
        <P>Несколько идей подарков. Самое главное — приходи.</P>
      </section>
      <section className="wishlist-content section">
        <div
          className="gift-settings"
          role="region"
          aria-label={t("Фильтры подарков")}
        >
          <div className="filter-fields">
            <label>
              {t("Категория")}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {["Все", "Книги", "Для дома", "Впечатления", "Творчество"].map(
                  (s) => (
                    <option key={s} value={s}>
                      {t(s)}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label>
              {t("Валюта")}
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="KZT">{t("Тенге")}</option>
                <option value="RUB">{t("Рубли")}</option>
              </select>
            </label>
            <label>
              {t("Бюджет до")}
              <select
                value={Number.isFinite(budget) ? budget : "all"}
                onChange={(e) =>
                  setBudget(
                    e.target.value === "all"
                      ? Infinity
                      : Number(e.target.value),
                  )
                }
              >
                <option value="all">{t("Любой")}</option>
                {[5000, 10000, 15000, 20000].map((n) => (
                  <option value={n} key={n}>
                    {price(n)}
                  </option>
                ))}
              </select>
            </label>
            <div
              className="sort-controls"
              role="group"
              aria-label={t("Сортировка по цене")}
            >
              <button
                type="button"
                aria-label={t("Сначала дешевле")}
                title={t("Сначала дешевле")}
                aria-pressed={sort === "cheap"}
                onClick={() => setSort(sort === "cheap" ? "default" : "cheap")}
              >
                <ArrowUpIcon size={22} />
              </button>
              <button
                type="button"
                aria-label={t("Сначала дороже")}
                title={t("Сначала дороже")}
                aria-pressed={sort === "expensive"}
                onClick={() =>
                  setSort(sort === "expensive" ? "default" : "expensive")
                }
              >
                <ArrowDownIcon size={22} />
              </button>
            </div>
          </div>
          <div className="price-tags" role="group" aria-label={t("Бюджет от")}>
            {[0, 1000, 5000, 10000].map((n) => (
              <button
                type="button"
                className="filter-tag"
                aria-pressed={minimum === n}
                key={n}
                onClick={() => setMinimum(n)}
              >
                {t(
                  n === 0
                    ? "Любая цена"
                    : "От " + n.toLocaleString("ru-RU") + " ₸",
                )}
              </button>
            ))}
            <button
              type="button"
              className="filter-reset"
              onClick={() => {
                setCategory("Все");
                setBudget(Infinity);
                setMinimum(0);
                setSort("default");
                setCurrency("KZT");
              }}
            >
              {t("Сбросить")}
            </button>
          </div>
          {currency === "RUB" && (
            <P className="small">
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

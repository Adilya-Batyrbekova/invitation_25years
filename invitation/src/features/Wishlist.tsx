import {
  readGiftReservations,
  updateGiftReservation,
  guestResponsesEnabled,
  type GiftReservationStatus,
} from "../data/guestResponses";
import { useEditorContent } from "../data/editorContent";
import { PreferenceCards } from "./PreferenceCards";
import { SlidersHorizontalIcon, ArrowsDownUpIcon } from "@phosphor-icons/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import { P } from "../components/Text";
import { FormattedText } from "../components/FormattedText";
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
function ReserveButton({ gift, onClick }: { gift: Gift; onClick: () => void }) {
  const available = gift.availability === "available";
  const actionable = available || gift.availability === "own";
  return (
    <button
      type="button"
      className={"button " + (available ? "filled" : "unavailable")}
      disabled={!actionable}
      aria-haspopup={actionable ? "dialog" : undefined}
      onClick={onClick}
    >
      {t(
        available
          ? "Забронировать"
          : gift.availability === "own"
            ? "Твоя бронь"
            : gift.availability === "reserved"
              ? "Забронировано"
              : "Бронь недоступна",
      )}
    </button>
  );
}
function ReservationForm({
  gift,
  onChanged,
  onCancel,
}: {
  gift: Gift;
  onChanged: (own?: boolean) => void;
  onCancel: () => void;
}) {
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
        const giver = String(
          new FormData(e.currentTarget).get("giver") ?? "",
        ).trim();
        const cancel = gift.availability === "own";
        if (!cancel && !giver) {
          setError("Введи, пожалуйста, своё имя.");
          return;
        }
        setBusy(true);
        setError("");
        try {
          if (!guestResponsesEnabled) {
            await submitDraft();
            return;
          }
          const changed = await updateGiftReservation(
            gift.id,
            cancel ? undefined : giver,
          );
          if (!changed) {
            onChanged();
            throw new Error(
              cancel ? "Бронь уже снята." : "Этот подарок уже забронировали.",
            );
          }
          onChanged(!cancel);
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {gift.availability === "own" ? (
        <P>Этот подарок уже закреплён за тобой. Здесь можно снять бронь.</P>
      ) : (
        <>
          <P>Запиши своё имя, чтобы закрепить выбранный подарок за собой 😊</P>
          <label className="reservation-name">
            {t("Твоё имя")}
            <input
              required
              maxLength={60}
              name="giver"
              disabled={busy}
              autoComplete="off"
            />
          </label>
        </>
      )}
      <button
        className="button filled"
        type="submit"
        disabled={busy}
        aria-busy={busy}
      >
        {t(
          gift.availability === "own"
            ? busy
              ? "Отменяем…"
              : "Отменить бронь"
            : busy
              ? "Бронируем…"
              : "Забронировать",
        )}
      </button>
      <button
        className="reservation-cancel"
        type="button"
        onClick={onCancel}
        disabled={busy}
      >
        {t("Отменить")}
      </button>
      {error && (
        <p role="alert" className="form-error">
          {t(error)}
        </p>
      )}
    </form>
  );
}

export function Wishlist() {
  const { items: gifts, intro: giftIntro } = useEditorContent("gifts");
  const ideas = useEditorContent("ideas");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ideaImage, setIdeaImage] = useState("");
  const ideaDialog = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState<"ideas" | "gifts">(() =>
    new URLSearchParams(location.hash.split("?")[1]).get("view") === "gifts"
      ? "gifts"
      : "ideas",
  );
  const [category, setCategory] = useState<string[]>([]);
  const [budget, setBudget] = useState(Infinity);
  const [minimum, setMinimum] = useState(0);
  const [sort, setSort] = useState("name");
  const [currency, setCurrency] = useState("KZT");
  const [selectedGift, setSelected] = useState<Gift | null>(null);
  const [reservations, setReservations] = useState<GiftReservationStatus[]>();
  const [reservationMessage, setReservationMessage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const modal = dialog.current;
    if (!selectedGift || !modal || modal.open) return;
    modal.showModal();
    modal.querySelector("input")?.focus();
  }, [selectedGift]);
  useEffect(() => {
    let active = true;
    void readGiftReservations().then((rows) => {
      if (active) setReservations(rows);
    });
    return () => {
      active = false;
    };
  }, []);
  const giftStatus = (gift: Gift): Gift => {
    if (!guestResponsesEnabled) return gift;
    const row = reservations?.find(({ gift_id }) => gift_id === gift.id);
    return {
      ...gift,
      availability: row?.own
        ? "own"
        : row?.reserved
          ? "reserved"
          : row?.bookable
            ? "available"
            : "unavailable",
    };
  };
  const selected = selectedGift && giftStatus(selectedGift);
  const refreshReservation = (id: number, own?: boolean) => {
    if (own !== undefined) {
      setReservations((rows) =>
        rows?.map((row) =>
          row.gift_id === id ? { ...row, own, reserved: own } : row,
        ),
      );
      dialog.current?.close();
      setReservationMessage(own ? "Подарок забронирован." : "Бронь отменена.");
    }
    void readGiftReservations().then((rows) => {
      if (rows) setReservations(rows);
    });
  };
  const openReservation = (gift: Gift) => {
    setReservationMessage("");
    setSelected(gift);
  };
  const priceLimit = Math.max(
    1000,
    Math.ceil(Math.max(...gifts.map((gift) => gift.price)) / 1000) * 1000,
  );
  const maximum = Math.min(budget, priceLimit);
  useEffect(() => {
    const scope = grid.current?.closest("main");
    if (!scope || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const cards = [
      ...scope.querySelectorAll<HTMLElement>(
        view === "gifts" ? ".gift-card" : ".gift-ideas article",
      ),
    ];
    const animations = new Map<Element, Animation>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, intersectionRatio } of entries) {
          if (intersectionRatio === 0) {
            animations.get(target)?.cancel();
            animations.delete(target);
          } else if (intersectionRatio >= 0.12 && !animations.has(target)) {
            animations.set(
              target,
              target.animate(
                [
                  {
                    opacity: 0.4,
                    transform: "translateY(14px)",
                    filter: "blur(2px)",
                  },
                  { opacity: 1, transform: "translateY(0)", filter: "blur(0)" },
                ],
                { duration: 360, easing: "ease-out" },
              ),
            );
          }
        }
      },
      { threshold: [0, 0.12] },
    );
    cards.forEach((card) => observer.observe(card));
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, [category, budget, minimum, sort, view, gifts, ideas]);
  const shown = filterGifts(category, budget, sort, minimum, gifts).map(
    giftStatus,
  );
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
        {view === "ideas" ? (
          <FormattedText value={ideas.intro} />
        ) : (
          <p>{t(giftIntro)}</p>
        )}
      </section>
      {view === "ideas" && (
        <PreferenceCards
          cards={ideas.cards}
          openPhoto={(src) => {
            setIdeaImage(src);
            ideaDialog.current?.showModal();
          }}
        />
      )}
      <section className="wishlist-content section" hidden={view !== "gifts"}>
        <div
          className="gift-categories"
          role="group"
          aria-label={t("Категория")}
        >
          {[
            "Все",
            ...new Set(
              gifts
                .map(({ category }) => category)
                .filter((name) => name && name !== "Все"),
            ),
          ].map((name) => (
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
          ))}
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
        <p className="gift-reservation-status" role="status">
          {t(reservationMessage)}
        </p>
        <div className="gift-grid" ref={grid}>
          {shown.map((g) => (
            <article className="gift-card" key={g.id}>
              {(g.availability === "available" || g.availability === "own") && (
                <button
                  type="button"
                  className="gift-open"
                  aria-label={t(
                    (g.availability === "own"
                      ? "Твоя бронь: "
                      : "Забронировать: ") + g.name,
                  )}
                  aria-haspopup="dialog"
                  onClick={() => openReservation(g)}
                />
              )}
              <div className="gift-picture">
                {g.images?.[0] ? (
                  <img
                    src={g.images[0].src}
                    alt={t(g.images[0].alt)}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <GiftArt shape={g.shape} />
                )}
              </div>
              <div className="gift-info">
                <h2 className="gift-name">{t(g.name)}</h2>
                {g.description && (
                  <p className="gift-description">{t(g.description)}</p>
                )}
                <p className="gift-price">{price(g.price)}</p>
                {g.shop?.name && (
                  <p className="gift-shop-name">
                    {t("Магазин: " + g.shop.name)}
                  </p>
                )}
              </div>
              <div className="gift-actions">
                <ShopLink gift={g} />
                <ReserveButton gift={g} onClick={() => openReservation(g)} />
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
        className="reservation-dialog"
        aria-labelledby="reservation-heading"
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <button
          type="button"
          className="close-dialog"
          aria-label={t("Закрыть")}
          onClick={() => dialog.current?.close()}
        >
          <XIcon size={20} />
        </button>
        {selected && (
          <>
            <h2 id="reservation-heading">
              {t(
                selected.availability === "own"
                  ? "Твоя бронь"
                  : "Забронировать подарок",
              )}
            </h2>
            <div className="reservation-summary">
              <div className="reservation-photo">
                {selected.images?.[0] ? (
                  <img
                    src={selected.images[0].src}
                    alt={t(selected.images[0].alt)}
                  />
                ) : (
                  <GiftArt shape={selected.shape} />
                )}
              </div>
              <div>
                <h3>{t(selected.name)}</h3>
                {selected.description && <P>{selected.description}</P>}
                <p className="gift-price">{price(selected.price)}</p>
              </div>
            </div>
            {selected.availability === "available" ||
            selected.availability === "own" ? (
              <ReservationForm
                gift={selected}
                key={selected.id}
                onChanged={(own) => refreshReservation(selected.id, own)}
                onCancel={() => dialog.current?.close()}
              />
            ) : (
              <>
                <P>Этот подарок сейчас нельзя забронировать.</P>
                <button
                  className="reservation-cancel"
                  type="button"
                  onClick={() => dialog.current?.close()}
                >
                  {t("Закрыть")}
                </button>
              </>
            )}
          </>
        )}
      </dialog>
    </>
  );
}

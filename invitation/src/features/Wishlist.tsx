import { useRef, useState } from "react";
import {
  SlidersHorizontalIcon,
  ArrowUpRightIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Title, P } from "../components/Text";
import { GiftArt, Doodle } from "../components/Art";
import { filterGifts, type Gift } from "../data/content";
import { submitDraft } from "../data/submissions";
import { t } from "../lib/typography";
export function Wishlist() {
  const [category, setCategory] = useState("Все");
  const [budget, setBudget] = useState(20000);
  const [sort, setSort] = useState("default");
  const [currency, setCurrency] = useState("KZT");
  const [selected, setSelected] = useState<Gift | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const shown = filterGifts(category, budget, sort);
  const price = (n: number) => t(n.toLocaleString("ru-RU") + " ₸");
  return (
    <>
      <section className="subpage-intro">
        <Doodle kind="flower" />
        <Title hero>Вишлист</Title>
        <P>
          Самое главное — приходи. А если хочется подарить что-то ещё, здесь
          несколько идей. Никаких обязательств.
        </P>
      </section>
      <section className="wishlist-content section">
        <details className="gift-settings">
          <summary>
            <SlidersHorizontalIcon size={23} />
            {t("Валюта и фильтры")}
          </summary>
          <div className="settings-grid">
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
              {t("Бюджет до")}
              <select
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
              >
                {[5000, 10000, 15000, 20000].map((n) => (
                  <option value={n} key={n}>
                    {price(n)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("Порядок")}
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="default">{t("Как в списке")}</option>
                <option value="cheap">{t("Сначала дешевле")}</option>
                <option value="expensive">{t("Сначала дороже")}</option>
              </select>
            </label>
            <button
              className="text-link"
              onClick={() => {
                setCategory("Все");
                setBudget(20000);
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
        </details>
        <div className="gift-grid">
          {shown.map((g) => (
            <button
              className="gift-card"
              key={g.id}
              onClick={() => {
                setSelected(g);
                setError("");
                dialog.current?.showModal();
              }}
            >
              <div className="gift-picture">
                <GiftArt shape={g.shape} />
                <span className="gift-arrow">
                  <ArrowUpRightIcon size={24} />
                </span>
              </div>
              <span className="gift-category">{t(g.category)}</span>
              <span className="gift-name">{t(g.name)}</span>
              <span className="gift-bottom">
                <span>{price(g.price)}</span>
                <span>{t("Свободен")}</span>
              </span>
            </button>
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
            <div className="dialog-picture">
              <GiftArt shape={selected.shape} />
            </div>
            <div className="dialog-copy">
              <h2>{t(selected.name)}</h2>
              <P>{selected.description}</P>
              <p className="dialog-price">{price(selected.price)}</p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
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
                <label>
                  {t("Твоё имя")}
                  <input
                    required
                    maxLength={60}
                    name="giver"
                    placeholder={t("Имя останется в секрете от гостей")}
                  />
                </label>
                <button className="button filled" disabled={busy}>
                  {t(busy ? "Бронируем…" : "Забронировать")}
                </button>
                {error && (
                  <p role="alert" className="form-error">
                    {t(error)}
                  </p>
                )}
              </form>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}

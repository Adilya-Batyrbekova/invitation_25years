import { useState } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { t } from "../lib/typography";
import { submitDraft } from "../data/submissions";
export function GuestForm({ wish = false }: { wish?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className={"guest-form " + (wish ? "postcard-form" : "")}
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
      <label>
        {t("Твоё имя")}
        <input
          name="name"
          required
          maxLength={60}
          autoComplete="given-name"
          placeholder={t("Как тебя зовут?")}
        />
      </label>
      {wish ? (
        <label>
          {t("Твоя открытка")}
          <textarea
            name="wish"
            required
            maxLength={1500}
            rows={5}
            placeholder={t(
              "Напиши пожелание, смешное воспоминание или просто пару тёплых слов.",
            )}
          />
        </label>
      ) : (
        <fieldset>
          <legend className="sr-only">{t("Ты придёшь?")}</legend>
          <label className="radio">
            <input type="radio" name="attendance" value="yes" required />
            {t("Приду")}
          </label>
          <label className="radio">
            <input type="radio" name="attendance" value="no" required />
            {t("Не приду")}
          </label>
        </fieldset>
      )}
      {wish && (
        <p className="small">
          {t("Твоё имя и текст будут видны другим гостям.")}
        </p>
      )}
      <button className="button filled" disabled={busy}>
        {t(
          busy
            ? "Отправляем…"
            : wish
              ? "Опубликовать пожелание"
              : "Отправить ответ",
        )}
        <ArrowRightIcon size={22} />
      </button>
      {error && (
        <p className="form-error" role="alert">
          {t(error)}
        </p>
      )}
    </form>
  );
}

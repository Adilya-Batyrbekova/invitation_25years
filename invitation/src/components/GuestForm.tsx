import { SendFlight } from "./SendFlight";
import { useState } from "react";
import { t } from "../lib/typography";
import { submitDraft } from "../data/submissions";
import {
  guestResponsesEnabled,
  saveGuestResponse,
  type Wish,
} from "../data/guestResponses";

export function GuestForm({
  wish = false,
  editing,
  onSaved,
}: {
  wish?: boolean;
  editing?: Wish;
  onSaved?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className={"guest-form " + (wish ? "postcard-form" : "")}
      autoComplete="off"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        const form = e.currentTarget;
        setBusy(true);
        setError("");
        setComplete(false);
        try {
          if (preview) {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            setComplete(true);
          } else if (guestResponsesEnabled) {
            await saveGuestResponse(new FormData(form), wish, editing?.id);
            form.reset();
            setComplete(true);
            onSaved?.();
          } else {
            await submitDraft();
          }
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy && <SendFlight />}
      <label>
        {t("Твоё имя")}
        <input
          name="name"
          defaultValue={editing?.name}
          required
          maxLength={60}
          autoComplete="off"
          placeholder={t("Как тебя зовут?")}
        />
      </label>
      {wish ? (
        <label>
          {t("Твоя открытка")}
          <textarea
            name="wish"
            defaultValue={editing?.message}
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
      {!guestResponsesEnabled && (
        <label className="radio">
          <input
            type="checkbox"
            checked={preview}
            onChange={(event) => setPreview(event.target.checked)}
          />
          {t("Пробная отправка — только показ анимации")}
        </label>
      )}
      {complete && (
        <p role="status">
          {t(
            guestResponsesEnabled
              ? wish
                ? "Пожелание сохранено."
                : "Ответ сохранён."
              : "Пробная отправка завершена. Данные не сохранялись.",
          )}
        </p>
      )}
      <button
        className="button filled send-button"
        type="submit"
        disabled={busy}
        aria-busy={busy}
      >
        {t(busy ? "Отправляем…" : editing ? "Сохранить" : "Отправить")}
        <svg
          className="send-plane"
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        >
          <path d="M3 10 21 3l-6 18-4-7-8-4Zm8 4L21 3" />
        </svg>
      </button>
      {error && (
        <p className="form-error" role="alert">
          {t(error)}
        </p>
      )}
    </form>
  );
}

import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Title, P } from "../components/Text";
import { GuestForm } from "../components/GuestForm";
import { t } from "../lib/typography";
import {
  guestResponsesEnabled,
  readWishes,
  deleteOwnWish,
  type Wish,
} from "../data/guestResponses";
const examples = [
  [
    "Аня",
    "Пусть в новом году жизни будет много света, тёплых встреч и смелости для самых заветных мечтаний!",
  ],
  ["Маша", "Обнимаю! Желаю замечать маленькие радости каждый день."],
  [
    "Дима",
    "С днём рождения! Пусть рядом всегда будут люди, с которыми можно быть собой. И пусть найдётся время на все путешествия, разговоры до ночи и спонтанные приключения.",
  ],
  ["Саша", "Пусть этот день останется одним из самых тёплых воспоминаний."],
  [
    "Лена",
    "Желаю вдохновения, любимых цветов и счастливых случайностей. Пусть всё задуманное постепенно сбывается, а впереди будет ещё больше поводов улыбаться!",
  ],
  [
    "Катя",
    "Как здорово собраться вместе. С твоими прекрасными двадцатью пятью!",
  ],
  [
    "Ира",
    "Пусть дома будет уютно, в душе — спокойно, а в жизни — достаточно места для нового.",
  ],
  ["Друг", "Счастья тебе и самых добрых людей рядом!"],
];
const samples = [...examples, ...examples, ...examples];
export function Memories() {
  const feed = useRef<HTMLDivElement>(null);
  const [result, setResult] =
    useState<Awaited<ReturnType<typeof readWishes>>>();
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const wishDialog = useRef<HTMLDialogElement>(null);
  const [wishAction, setWishAction] = useState<{
    kind: "edit" | "delete";
    wish: Wish;
  }>();
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  useLayoutEffect(() => {
    if (wishAction && !wishDialog.current?.open)
      wishDialog.current?.showModal();
  }, [wishAction]);
  const closeWishDialog = () => wishDialog.current?.close();
  function openWish(kind: "edit" | "delete", wish: Wish) {
    setDeleteError("");
    setWishAction({ kind, wish });
  }
  function onWishSaved() {
    closeWishDialog();
    setRefresh((value) => value + 1);
  }
  const [visible, setVisible] = useState(8);
  const [mobile, setMobile] = useState(
    () => matchMedia("(max-width: 767px)").matches,
  );
  const limit = mobile ? visible : 24 + visible - 8;
  useEffect(() => {
    if (!guestResponsesEnabled) return;
    let active = true;
    readWishes(limit + 1).then(
      (value) => {
        if (!active) return;
        setResult(value);
        setError(false);
      },
      () => {
        if (active) setError(true);
      },
    );
    return () => {
      active = false;
    };
  }, [limit, refresh]);
  useEffect(() => {
    if (!guestResponsesEnabled) return;
    const refreshVisible = () => {
      if (document.visibilityState === "visible")
        setRefresh((value) => value + 1);
    };
    const interval = window.setInterval(refreshVisible, 30_000);
    window.addEventListener("focus", refreshVisible);
    document.addEventListener("visibilitychange", refreshVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshVisible);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, []);
  const cards = guestResponsesEnabled
    ? (result?.wishes ?? []).slice(0, limit)
    : samples.slice(0, limit).map(([name, message], index) => ({
        id: String(index),
        name,
        message,
      }));
  const hasMore = guestResponsesEnabled
    ? (result?.wishes.length ?? 0) > limit
    : mobile && visible < samples.length;
  useEffect(() => {
    const media = matchMedia("(max-width: 767px)");
    const update = () => setMobile(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const container = feed.current;
    if (!container || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const card = entry.target as HTMLElement;
          if (!entry.isIntersecting || card.dataset.arrived) continue;
          card.dataset.arrived = "true";
          card.animate(
            [
              { opacity: 0, transform: "translateY(28px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 600, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
          );
          observer.unobserve(card);
        }
      },
      { threshold: 0.15 },
    );
    container
      .querySelectorAll(".wish-card")
      .forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [visible, mobile, result]);
  return (
    <>
      <section className="subpage-intro">
        <Title hero>На память</Title>
        <P>Оставь мне пожелание или воспоминание, которое хочется сохранить.</P>
      </section>
      <section className="memory-layout section">
        <div>
          <GuestForm wish onSaved={() => setRefresh((value) => value + 1)} />
        </div>
        <div className="memory-feed">
          <h2 className="plain-heading">{t("Ваши пожелания")}</h2>
          {guestResponsesEnabled && !result && !error && (
            <p role="status">{t("Загружаем пожелания…")}</p>
          )}
          {error && (
            <p role="status">
              {t("Не получилось загрузить пожелания.")}{" "}
              <button
                className="load-wishes"
                onClick={() => setRefresh((value) => value + 1)}
              >
                {t("Повторить")}
              </button>
            </p>
          )}
          {result?.wishes.length === 0 && <P>Здесь появятся ваши пожелания.</P>}
          <div
            ref={feed}
            className="wish-cards"
            tabIndex={0}
            role="region"
            aria-label={t("Лента пожеланий")}
          >
            {cards.map((card, index) => (
              <article
                className="wish-card"
                key={card.id}
                style={{ animationDelay: `${(index % 8) * 45}ms` }}
              >
                <div className="wish-card-heading">
                  <h3>{t(card.name)}</h3>
                  {result?.ownIds.has(card.id) && (
                    <div className="wish-card-actions">
                      <button
                        type="button"
                        className="wish-icon"
                        aria-label={t("Изменить пожелание")}
                        title={t("Изменить пожелание")}
                        onClick={() => openWish("edit", card)}
                      >
                        <PencilSimpleIcon size={18} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="wish-icon wish-delete"
                        aria-label={t("Удалить пожелание")}
                        title={t("Удалить пожелание")}
                        onClick={() => openWish("delete", card)}
                      >
                        <TrashIcon size={18} aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
                <p>{t(card.message)}</p>
              </article>
            ))}
          </div>
          {hasMore && (
            <button
              className="load-wishes"
              onClick={() => setVisible(visible + 8)}
            >
              {t("Загрузить ещё")}
            </button>
          )}
        </div>
      </section>
      <dialog
        ref={wishDialog}
        className="wish-dialog"
        aria-labelledby="wish-dialog-title"
        onCancel={(event) => {
          if (deleteBusy) event.preventDefault();
        }}
        onClose={() => setWishAction(undefined)}
      >
        {wishAction && (
          <>
            <h2 id="wish-dialog-title">
              {t(
                wishAction.kind === "edit"
                  ? "Изменить пожелание"
                  : "Удалить пожелание?",
              )}
            </h2>
            {wishAction.kind === "edit" ? (
              <GuestForm
                wish
                editing={wishAction.wish}
                onSaved={onWishSaved}
                onCancel={closeWishDialog}
              />
            ) : (
              <>
                <P>Пожелание исчезнет из общей ленты.</P>
                <div className="wish-dialog-actions">
                  <button
                    type="button"
                    className="button wish-secondary"
                    onClick={closeWishDialog}
                    disabled={deleteBusy}
                  >
                    {t("Отмена")}
                  </button>
                  <button
                    type="button"
                    className="button wish-delete-confirm"
                    disabled={deleteBusy}
                    onClick={async () => {
                      setDeleteBusy(true);
                      setDeleteError("");
                      try {
                        await deleteOwnWish(wishAction.wish.id);
                        onWishSaved();
                        feed.current?.focus();
                      } catch (error) {
                        setDeleteError((error as Error).message);
                      } finally {
                        setDeleteBusy(false);
                      }
                    }}
                  >
                    {t(deleteBusy ? "Удаляем…" : "Удалить")}
                  </button>
                </div>
                {deleteError && (
                  <p role="alert" className="form-error">
                    {t(deleteError)}
                  </p>
                )}
              </>
            )}
          </>
        )}
      </dialog>
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

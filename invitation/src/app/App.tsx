import { useEffect, useState } from "react";
import { ArrowLeftIcon, XIcon } from "@phosphor-icons/react";
import { Envelope } from "../components/Envelope";
import { Atmosphere } from "../components/Atmosphere";
import { Invitation } from "../features/Invitation";
import { Personal } from "../features/Personal";
import { Memories } from "../features/Memories";
import { Wishlist } from "../features/Wishlist";
import { readRoute, returnLink } from "../lib/navigation";
import { t } from "../lib/typography";
import { usePageMotion } from "./motion";
function isOpened() {
  try {
    return sessionStorage.getItem("invitation-opened") === "yes";
  } catch {
    return false;
  }
}
export function App() {
  const [route, setRoute] = useState(() => readRoute(location.hash));
  const [opened, setOpened] = useState(
    () =>
      isOpened() ||
      readRoute(location.hash).page !== "invitation" ||
      !!readRoute(location.hash).section,
  );
  const ref = usePageMotion(route.page + opened);
  useEffect(() => {
    const change = () => setRoute(readRoute(location.hash));
    addEventListener("hashchange", change);
    return () => removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    if (!opened) return;
    document.title = t(
      {
        invitation: "Мне 25! — Приглашение",
        personal: "Это всё я",
        memories: "На память",
        wishlist: "Вишлист",
      }[route.page],
    );
    const timer = setTimeout(() => {
      if (route.section) {
        const el = document.getElementById(route.section);
        el?.scrollIntoView();
        el?.focus({ preventScroll: true });
      } else {
        scrollTo(0, 0);
        ref.current?.scrollTo(0, 0);
        ref.current?.focus({ preventScroll: true });
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [route, opened, ref]);
  const open = () => {
    try {
      sessionStorage.setItem("invitation-opened", "yes");
    } catch {
      /* Session persistence is optional. */
    }
    setOpened(true);
  };
  return (
    <>
      <Atmosphere />
      {!opened ? (
        <Envelope onOpen={open} />
      ) : (
        <>
          <main
            ref={ref}
            tabIndex={-1}
            className={
              route.page === "invitation"
                ? "invitation-page"
                : "supplementary-page"
            }
          >
            {route.page === "invitation" ? (
              <Invitation />
            ) : route.page === "personal" ? (
              <Personal />
            ) : route.page === "memories" ? (
              <Memories />
            ) : (
              <Wishlist />
            )}
          </main>
          {route.page !== "invitation" && (
            <div className="return-dock">
              <a className="return-link" href={returnLink(route.page)}>
                <ArrowLeftIcon size={21} />
                {t("Приглашение")}
              </a>
            </div>
          )}
        </>
      )}
      {["contact", "telegram"].map((id) => (
        <dialog key={id} id={id + "-dialog"} className="notice-dialog">
          <form method="dialog">
            <button className="close-dialog" aria-label={t("Закрыть")}>
              <XIcon size={25} />
            </button>
            <h2>
              {t(id === "contact" ? "Давай поговорим" : "Наши фотографии")}
            </h2>
            <p>
              {t(
                id === "contact"
                  ? "Напиши мне в том чате, где ты получил это приглашение."
                  : "Ссылкой на нашу группу я поделюсь в чате с приглашением.",
              )}
            </p>
            <button className="button">{t("Хорошо")}</button>
          </form>
        </dialog>
      ))}
    </>
  );
}

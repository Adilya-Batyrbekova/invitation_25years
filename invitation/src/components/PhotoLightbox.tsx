import { useLayoutEffect, useRef } from "react";
import { XIcon } from "@phosphor-icons/react";
import { t } from "../lib/typography";

export function PhotoLightbox({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    if (src && !dialog.current?.open) dialog.current?.showModal();
  }, [src]);

  return (
    <dialog
      ref={dialog}
      className="idea-lightbox"
      onClose={onClose}
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
      {src && <img src={src} alt={t("Иллюстрация")} />}
    </dialog>
  );
}

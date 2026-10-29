import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { HeartIcon } from "@phosphor-icons/react";
import { Garland, Doodle } from "./Art";
import { t } from "../lib/typography";
gsap.registerPlugin(useGSAP);
export function Envelope({ onOpen }: { onOpen: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [opening, setOpening] = useState(false);
  const { contextSafe } = useGSAP({ scope: ref });
  const open = contextSafe(() => {
    if (opening) return;
    setOpening(true);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onOpen();
      return;
    }
    gsap
      .timeline({ onComplete: onOpen })
      .to(".seal", { scale: 0.85, opacity: 0, duration: 0.25 })
      .to(
        ".envelope-flap",
        { rotateX: 180, duration: 0.85, ease: "power2.inOut" },
        0.15,
      )
      .set(".envelope-flap", { zIndex: 0 }, 0.65)
      .set(".envelope-letter", { zIndex: 6 }, 0.7)
      .to(
        ".envelope-letter",
        { yPercent: -72, rotate: 0, duration: 0.85, ease: "power2.inOut" },
        0.7,
      )
      .to(
        ".envelope-letter",
        { yPercent: -38, scale: 1.06, duration: 0.65, ease: "power3.out" },
        1.55,
      )
      .to(ref.current, { opacity: 0, duration: 0.4 }, 2.65);
  });
  return (
    <div className="envelope-screen" ref={ref}>
      <Garland />
      <Doodle className="envelope-star" />
      <p className="envelope-kicker">{t("Маленькое приглашение для тебя")}</p>
      <button
        className="envelope"
        disabled={opening}
        onClick={open}
        aria-label={t("Открыть приглашение")}
      >
        <span className="envelope-letter">
          <span>{t("Мне 25!")}</span>
          <small>{t("28 ноября 2026")}</small>
        </span>
        <span className="envelope-back" />
        <span className="envelope-front" />
        <span className="envelope-flap" />
        <span className="seal">
          <HeartIcon weight="duotone" size={32} />
        </span>
      </button>
      <p className="envelope-caption">
        {t("Открой — внутри кое-что тёплое")}
        <span aria-hidden="true"> ↗</span>
      </p>
    </div>
  );
}

import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { t } from "../lib/typography";
export function Garland({
  bottom = false,
  compact = false,
}: {
  bottom?: boolean;
  compact?: boolean;
}) {
  return bottom ? (
    <div className="closing-art" aria-hidden="true">
      <Doodle kind="streamer" />
      <Doodle kind="flower" />
      <Doodle />
      <Doodle kind="heart" />
    </div>
  ) : (
    <div
      className={"garland" + (compact ? " garland-compact" : "")}
      aria-hidden="true"
    >
      <img src="art/paper-garland.png" width="1600" height="533" alt="" />
      <img src="art/paper-garland.png" width="1600" height="533" alt="" />
    </div>
  );
}
export function Doodle({
  kind = "star",
  className = "",
}: {
  kind?: "star" | "heart" | "flower" | "streamer";
  className?: string;
}) {
  return (
    <span
      className={"doodle painted-ornament ornament-" + kind + " " + className}
      aria-hidden="true"
    />
  );
}
export function HandArrow() {
  return (
    <svg
      className="hand-arrow"
      viewBox="0 0 72 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 19Q28 10 63 15M49 4Q57 10 65 15Q58 18 51 27"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 22Q32 14 59 17"
        stroke="currentColor"
        strokeWidth=".8"
        opacity=".4"
      />
    </svg>
  );
}
export function Butterfly({ className = "" }: { className?: string }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const layer = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = anchor.current?.getBoundingClientRect();
        if (rect && layer.current)
          Object.assign(layer.current.style, {
            left: rect.left + "px",
            top: rect.top + "px",
            width: rect.width + "px",
            height: rect.height + "px",
          });
      });
    };
    update();
    addEventListener("scroll", update, true);
    addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", update, true);
      removeEventListener("resize", update);
    };
  }, []);
  return (
    <>
      <span
        ref={anchor}
        className={"flying-butterfly butterfly-anchor " + className}
        aria-hidden="true"
      />
      {createPortal(
        <span ref={layer} className="butterfly-layer" aria-hidden="true">
          <span className="flying-butterfly butterfly-visible">
            <span className="butterfly-wing butterfly-left" />
            <span className="butterfly-wing butterfly-right" />
          </span>
        </span>,
        document.body,
      )}
    </>
  );
}

export function GiftArt({ shape }: { shape: string }) {
  return (
    <div className={"gift-art " + shape} aria-hidden="true">
      {shape === "book" ? (
        <>
          <div />
          <i />
          <span>{t("маленькие истории")}</span>
        </>
      ) : shape === "cup" ? (
        <>
          <div />
          <i />
        </>
      ) : shape === "vase" ? (
        <>
          <i />
          <div />
        </>
      ) : shape === "camera" ? (
        <>
          <div />
          <i />
          <b />
        </>
      ) : shape === "candle" ? (
        <>
          <i />
          <div />
        </>
      ) : (
        <>
          <div />
          {Array.from({ length: 6 }, (_, i) => (
            <i key={i} style={{ "--i": i } as CSSProperties} />
          ))}
        </>
      )}
    </div>
  );
}

export function HandUnderline() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const link = ref.current?.closest("a");
    if (!link) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let animation: Animation | undefined;
    const draw = () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      animation?.cancel();
      animation = ref.current
        ?.querySelector("path")
        ?.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
          duration: 240,
          easing: "ease-out",
          fill: "forwards",
        });
    };
    const click = (event: MouseEvent) => {
      draw();
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.target === "_blank" ||
        !link.hash.startsWith("#/")
      )
        return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      event.preventDefault();
      clearTimeout(timer);
      timer = setTimeout(() => {
        location.hash = link.hash;
      }, 240);
    };
    link.addEventListener("pointerenter", draw);
    link.addEventListener("pointerdown", draw);
    link.addEventListener("click", click);
    return () => {
      link.removeEventListener("pointerenter", draw);
      link.removeEventListener("pointerdown", draw);
      link.removeEventListener("click", click);
      clearTimeout(timer);
      animation?.cancel();
    };
  }, []);
  return (
    <svg
      ref={ref}
      className="hand-underline"
      viewBox="0 0 200 24"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path pathLength="1" d="M4 16C38 5 73 20 111 12S164 6 196 11" />
    </svg>
  );
}
export function RsvpSurface() {
  const top = "M0 0H1000";
  return (
    <svg
      className="rsvp-surface"
      viewBox="0 0 1000 500"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path fill="var(--yellow-paper)" d={top + "V500H0Z"} />
    </svg>
  );
}

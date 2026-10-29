import type { CSSProperties } from "react";
import { t } from "../lib/typography";
export function Garland({ bottom = false }: { bottom?: boolean }) {
  return bottom ? (
    <div className="closing-art" aria-hidden="true">
      <Doodle kind="streamer" />
      <Doodle kind="flower" />
      <Doodle />
      <Doodle kind="heart" />
    </div>
  ) : (
    <div className="garland" aria-hidden="true">
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
export function Butterfly() {
  return (
    <span className="flying-butterfly" aria-hidden="true">
      <span className="butterfly-wing butterfly-left" />
      <span className="butterfly-wing butterfly-right" />
    </span>
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

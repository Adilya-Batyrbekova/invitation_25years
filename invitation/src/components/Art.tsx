import type { CSSProperties } from "react";
import { t } from "../lib/typography";
export function Garland({ bottom = false }: { bottom?: boolean }) {
  return (
    <div
      className={"garland " + (bottom ? "garland-bottom" : "")}
      aria-hidden="true"
    >
      {Array.from({ length: 26 }, (_, i) => (
        <span
          key={i}
          style={
            {
              "--i": i,
              "--turn": `${i % 2 ? 62 : -25}deg`,
              "--sag": `${Math.sin(i / 4) * 38}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
export function Doodle({
  kind = "star",
  className = "",
}: {
  kind?: "star" | "heart" | "flower";
  className?: string;
}) {
  return (
    <svg
      className={"doodle " + className}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={
          kind === "heart"
            ? "M51 80C34 63 12 48 17 29C23 7 44 23 49 36C59 7 85 12 85 32C85 53 65 68 51 80Z"
            : kind === "flower"
              ? "M49 41C20 10 8 47 38 50C3 72 34 92 48 60C59 96 87 69 60 52C94 38 67 13 52 40ZM50 61Q42 80 47 98"
              : "M49 9L59 37L88 35L65 54L76 85L50 68L22 88L32 57L9 39L40 38Z"
        }
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

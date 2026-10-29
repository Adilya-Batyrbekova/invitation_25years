import type { CSSProperties } from "react";
import { t } from "../lib/typography";
export function Title({
  children,
  hero = false,
}: {
  children: string;
  hero?: boolean;
}) {
  const text = t(children);
  const Tag = hero ? "h1" : "h2";
  let index = 0;
  return (
    <Tag
      className={"handwriting " + (hero ? "hero-title" : "")}
      aria-label={text}
    >
      <span aria-hidden="true">
        {text.split(" ").map((word, i) => (
          <span className="written-word" key={i}>
            {[...word].map((c) => (
              <span
                className="written-char"
                key={index}
                style={{ "--char": index++ } as CSSProperties}
              >
                {c}
              </span>
            ))}{" "}
          </span>
        ))}
      </span>
    </Tag>
  );
}
export function P({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return <p className={className}>{t(children)}</p>;
}

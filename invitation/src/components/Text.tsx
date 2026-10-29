import { Fragment, type CSSProperties, type ReactNode } from "react";
import { t } from "../lib/typography";
import { lettering } from "../data/lettering";

// Body copy stays grouped by word; headings reveal prefilled font glyphs below.
export function Words({ children }: { children: string }) {
  return t(children)
    .split(/(\s+)/u)
    .map((part, i) =>
      /\S/u.test(part) ? (
        <span className="text-word" key={i}>
          {part}
        </span>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    );
}
export function Title({
  children,
  hero = false,
}: {
  children: string;
  hero?: boolean;
}) {
  const Tag = hero ? "h1" : "h2";
  const text = t(children);
  return (
    <Tag
      className={"handwriting " + (hero ? "hero-title" : "")}
      aria-label={text}
    >
      <span aria-hidden="true">
        {text.split(/(\s+)/u).map((part, i) =>
          /\S/u.test(part) ? (
            <span className="written-word" key={i}>
              {[...part].map((char, j) => {
                const glyph = lettering.glyphs[char];
                return (
                  <span
                    className={
                      "written-char" + (glyph?.path ? " vector-letter" : "")
                    }
                    key={j}
                    style={
                      glyph?.path
                        ? ({
                            width: glyph.width / lettering.units + "em",
                          } as CSSProperties)
                        : undefined
                    }
                  >
                    {glyph?.path ? (
                      <svg
                        className="glyph-svg"
                        viewBox={`0 ${-lettering.ascent} ${glyph.width} ${lettering.ascent - lettering.descent}`}
                        aria-hidden="true"
                      >
                        <path className="glyph-fill" d={glyph.path} />
                      </svg>
                    ) : (
                      char
                    )}
                  </span>
                );
              })}
            </span>
          ) : (
            <Fragment key={i}>{part}</Fragment>
          ),
        )}
      </span>
    </Tag>
  );
}

export function P({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={"word-copy " + className}>
      {typeof children === "string" ? <Words>{children}</Words> : children}
    </p>
  );
}

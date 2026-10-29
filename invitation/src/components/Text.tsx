import { Fragment, type CSSProperties } from "react";
import { t } from "../lib/typography";
import { lettering } from "../data/lettering";
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
          <Fragment key={i}>
            <span className="written-word">
              {[...word].map((c) => (
                <span
                  className={
                    "written-char" +
                    (lettering.glyphs[c]?.path ? " vector-letter" : "")
                  }
                  key={index}
                  style={
                    {
                      "--char": index++,
                      ...(lettering.glyphs[c]?.path
                        ? {
                            width: `${lettering.glyphs[c].width / lettering.units}em`,
                          }
                        : {}),
                    } as CSSProperties
                  }
                >
                  {lettering.glyphs[c]?.path ? (
                    <>
                      <span className="glyph-copy">{c}</span>
                      <svg
                        className="glyph-svg"
                        viewBox={`0 ${-lettering.ascent} ${lettering.glyphs[c].width} ${lettering.ascent - lettering.descent}`}
                        aria-hidden="true"
                      >
                        <path
                          className="glyph-contour"
                          d={lettering.glyphs[c].path}
                          pathLength="1"
                        />
                        <path
                          className="glyph-fill"
                          d={lettering.glyphs[c].path}
                        />
                      </svg>
                    </>
                  ) : (
                    c
                  )}
                </span>
              ))}
            </span>{" "}
          </Fragment>
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

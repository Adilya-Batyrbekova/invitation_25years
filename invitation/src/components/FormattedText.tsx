import { Fragment } from "react";
import { t } from "../lib/typography";

function inline(line: string) {
  return line.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/u).map((part, index) => {
    if (index % 2 === 1) {
      return part.startsWith("**") ? (
        <strong key={index}>{t(part.slice(2, -2))}</strong>
      ) : (
        <em key={index}>{t(part.slice(1, -1))}</em>
      );
    }
    // Typograf trims segment boundaries. Keep the spaces next to emphasis.
    const [, start, text, end] = /^(\s*)(.*?)(\s*)$/u.exec(part)!;
    return <Fragment key={index}>{start + t(text) + end}</Fragment>;
  });
}

export function FormattedText({ value }: { value: string }) {
  const blocks: { list: boolean; lines: string[] }[] = [];
  let current: (typeof blocks)[number] | undefined;
  for (const line of value.split(/\r\n?|\n/u)) {
    if (!line.trim()) {
      current = undefined;
      continue;
    }
    const item = /^[-•][ \t]+(.*)$/u.exec(line);
    const list = Boolean(item);
    if (!current || current.list !== list) {
      current = { list, lines: [] };
      blocks.push(current);
    }
    current.lines.push(item ? item[1] : line);
  }
  return (
    <div className="formatted-text">
      {blocks.map(({ list, lines }, index) =>
        list ? (
          <ul key={index}>
            {lines.map((line, i) => (
              <li key={i}>{inline(line)}</li>
            ))}
          </ul>
        ) : (
          <p key={index}>
            {lines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {inline(line)}
              </Fragment>
            ))}
          </p>
        ),
      )}
    </div>
  );
}

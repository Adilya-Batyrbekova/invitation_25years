import { useId, useLayoutEffect, useRef } from "react";
import { FormattedText } from "../components/FormattedText";
import { t } from "../lib/typography";

const limit = 4000;

export function FormattedField({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: (value: string) => void;
}) {
  const id = useId();
  const field = useRef<HTMLTextAreaElement>(null);
  const caret = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (caret.current === null) return;
    field.current?.focus();
    field.current?.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  }, [value]);

  return (
    <div className="owner-formatted-field">
      <label htmlFor={id}>{t(label)}</label>
      <textarea
        id={id}
        ref={field}
        value={value}
        rows={5}
        maxLength={limit}
        onChange={(event) => change(event.target.value)}
        onKeyDown={(event) => {
          if (
            event.key !== "Enter" ||
            event.shiftKey ||
            event.nativeEvent.isComposing
          )
            return;
          event.preventDefault();
          const { selectionStart, selectionEnd } = event.currentTarget;
          const next =
            value.slice(0, selectionStart) + "\n\n" + value.slice(selectionEnd);
          if (next.length > limit || next === value) return;
          caret.current = selectionStart + 2;
          change(next);
        }}
      />
      <details className="owner-format-preview">
        <summary>{t("Предпросмотр текста")}</summary>
        <FormattedText value={value} />
      </details>
    </div>
  );
}

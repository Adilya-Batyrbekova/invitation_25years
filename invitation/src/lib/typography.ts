import Typograf from "typograf";
const engine = new Typograf({
  locale: ["ru", "en-US"],
  htmlEntity: { type: "default" },
});
engine.disableRule(["ru/other/phone-number"]);
const cache = new Map<string, string>();
/** Shared local formatter: return plain text and preserve owner wording. */
export function t(source: string): string {
  const found = cache.get(source);
  if (found !== undefined) return found;
  const result = engine.execute(source.replace(/\u00a0/g, " "));
  if (cache.size > 1500) cache.clear();
  cache.set(source, result);
  return result;
}

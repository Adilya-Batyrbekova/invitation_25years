import { runTypograph } from "./vendor/sboltypograph.js";
const cache = new Map<string, string>();
/** All public text passes through the locally adapted SBOL engine; never HTML. */
export function t(source: string): string {
  const found = cache.get(source);
  if (found !== undefined) return found;
  // Upstream misses a spaced sentence dash after a closing quote.
  const result = (
    runTypograph(source.replace(/\u00a0/g, " ")) as string
  ).replace(/(\S)[ \u00a0]+-[ \u00a0]+(?=\S)/g, "$1\u00a0— ");
  if (cache.size > 1500) cache.clear();
  cache.set(source, result);
  return result;
}

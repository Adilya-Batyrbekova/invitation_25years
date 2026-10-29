export type Page = "invitation" | "personal" | "memories" | "wishlist";
export function readRoute(hash: string): {
  page: Page;
  section: string | null;
} {
  const [path, query] = hash.replace(/^#\/?/, "").split("?");
  const page: Page = ["personal", "memories", "wishlist"].includes(path)
    ? (path as Page)
    : "invitation";
  const section = new URLSearchParams(query).get("section");
  return {
    page,
    section: section === "gifts" || section === "personal" ? section : null,
  };
}
export function returnLink(page: Page) {
  return "#/invitation?section=" + (page === "wishlist" ? "gifts" : "personal");
}

import { describe, it, expect } from "vitest";
import { readRoute, returnLink } from "./navigation";
describe("static-host routes", () => {
  it("supports direct links and contextual return", () => {
    expect(readRoute("#/wishlist").page).toBe("wishlist");
    expect(readRoute(returnLink("wishlist"))).toEqual({
      page: "invitation",
      section: "gifts",
    });
    expect(readRoute(returnLink("memories")).section).toBe("personal");
  });
  it("falls back safely for invalid paths and sections", () => {
    expect(readRoute("#/unknown?section=bad")).toEqual({
      page: "invitation",
      section: null,
    });
  });
});

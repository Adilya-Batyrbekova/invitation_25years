import { describe, it, expect } from "vitest";
import { filterGifts } from "./content";
import { submitDraft } from "./submissions";
describe("wishlist layout data", () => {
  it("combines category and inclusive budget filters", () => {
    expect(filterGifts("Для дома", 8500, "cheap").map((g) => g.price)).toEqual([
      4500, 8500,
    ]);
  });
  it("provides an empty result without changing the catalogue", () => {
    expect(filterGifts("Книги", 5000, "default")).toHaveLength(0);
    expect(filterGifts("Все", 20000, "default")).toHaveLength(6);
  });
  it("does not claim a successful save without a backend", async () => {
    await expect(submitDraft()).rejects.toThrow("Не получилось отправить");
  });
});

import { describe, expect, it } from "vitest";
import { lettering } from "./lettering";

describe("prepared Great Vibes lettering", () => {
  it("has drawable paths and valid advances for the full Russian alphabet", () => {
    const alphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
    for (const char of alphabet + alphabet.toLowerCase() + "0123456789!?") {
      expect(lettering.glyphs[char]?.width).toBeGreaterThan(0);
      expect(lettering.glyphs[char]?.path).toMatch(/^M/);
    }
  });
  it("keeps the baseline inside the shared vector viewbox", () => {
    expect(lettering.units).toBe(1000);
    expect(lettering.ascent).toBeGreaterThan(0);
    expect(lettering.descent).toBeLessThan(0);
    expect(lettering.ascent - lettering.descent).toBeGreaterThan(
      lettering.units,
    );
  });
});

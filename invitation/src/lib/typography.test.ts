import { describe, it, expect } from "vitest";
import { t } from "./typography";
describe("local Russian typography", () => {
  it("formats quotes and a sentence dash", () => {
    expect(t('Это "праздник" - для тебя')).toContain("«праздник»");
    expect(t('Это "праздник" - для тебя')).toContain("—");
  });
  it("binds prepositions and is stable on repeated display", () => {
    const source = "Приходи на день рождения";
    const result = t(source);
    expect(result).toContain("на\u00a0");
    expect(t(result)).toBe(result);
  });
  it("preserves event details and meaningful casing", () => {
    expect(t("Астана, Абая, 88")).toContain("88");
    expect(t("С 14:00 до 18:00")).toContain("18:00");
    expect(t("Банк")).toBe("Банк");
  });
  it("returns guest markup as a plain string", () => {
    expect(typeof t("<img src=x onerror=alert(1)>")).toBe("string");
  });
});

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
    expect(t("Абая, 89")).toContain("89");
    expect(t("С 14:00 до 18:00")).toContain("18:00");
    expect(t("Банк")).toBe("Банк");
  });
  it("preserves intentional yo, proper names and telephone digits", () => {
    expect(t("Твоё имя")).toBe("Твоё имя");
    expect(t("Абая, 89")).toBe("Абая, 89");
    expect(t("+7 777 123 45 67")).toBe("+7 777 123 45 67");
  });
  it("returns guest markup as a plain string", () => {
    expect(t("<img src=x onerror=alert(1)>")).toBe(
      "<img src=x onerror=alert(1)>",
    );
  });
});

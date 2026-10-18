import { describe, expect, it } from "vitest";
import { isNavItemActive, navItems } from "./nav";

describe("навигация", () => {
  it("четыре раздела в порядке ТЗ", () => {
    expect(navItems.map((i) => i.label)).toEqual([
      "Сегодня",
      "Дневник",
      "Оценки",
      "Ещё",
    ]);
  });

  it("активен на своей и вложенных страницах, но не на похожих", () => {
    expect(isNavItemActive("/grades", "/grades")).toBe(true);
    expect(isNavItemActive("/grades", "/grades/algebra")).toBe(true);
    expect(isNavItemActive("/grades", "/gradesx")).toBe(false);
    expect(isNavItemActive("/diary", "/")).toBe(false);
  });
});

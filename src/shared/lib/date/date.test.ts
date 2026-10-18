import { describe, expect, it } from "vitest";
import {
  addDays,
  formatDayLong,
  formatDayOfMonth,
  formatWeekdayShort,
  schoolWeek,
  startOfWeek,
  todayIso,
} from "./date";

describe("даты дневника", () => {
  it("addDays переходит через месяц и год", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
  });

  it("неделя начинается с понедельника, воскресенье — в той же неделе", () => {
    expect(startOfWeek("2026-10-12")).toBe("2026-10-12");
    expect(startOfWeek("2026-10-15")).toBe("2026-10-12");
    expect(startOfWeek("2026-10-18")).toBe("2026-10-12");
  });

  it("учебная неделя — Пн–Сб", () => {
    expect(schoolWeek("2026-10-14")).toEqual([
      "2026-10-12",
      "2026-10-13",
      "2026-10-14",
      "2026-10-15",
      "2026-10-16",
      "2026-10-17",
    ]);
  });

  it("подписи по-русски", () => {
    expect(formatWeekdayShort("2026-10-12")).toBe("Пн");
    expect(formatWeekdayShort("2026-10-17")).toBe("Сб");
    expect(formatDayOfMonth("2026-10-05")).toBe("5");
    expect(formatDayLong("2026-10-12")).toBe("понедельник, 12 октября");
  });

  it("todayIso — местная дата, а не UTC", () => {
    expect(todayIso(new Date(2026, 0, 2, 0, 30))).toBe("2026-01-02");
  });

  it("неверный формат — ошибка", () => {
    expect(() => addDays("12.10.26", 1)).toThrow();
  });
});

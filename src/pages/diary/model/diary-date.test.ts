import { describe, expect, it } from "vitest";
import {
  formatMonth,
  formatTaskCount,
  formatWeekRange,
  relativeDayLabel,
  resolveDiaryDate,
  shiftSchoolDay,
  weekIsAvailable,
} from "./diary-date";

describe("resolveDiaryDate", () => {
  const today = "2026-10-15"; // четверг

  it("берёт дату из адреса", () => {
    expect(resolveDiaryDate("2026-10-12", today)).toBe("2026-10-12");
  });

  it("пустая или неверная дата — сегодня", () => {
    expect(resolveDiaryDate(null, today)).toBe(today);
    expect(resolveDiaryDate("2026-02-31", today)).toBe(today);
    expect(resolveDiaryDate("<script>", today)).toBe(today);
  });

  it("воскресенье — понедельник следующей недели", () => {
    expect(resolveDiaryDate("2026-10-18", today)).toBe("2026-10-19");
  });
});

describe("shiftSchoolDay", () => {
  it("перепрыгивает воскресенье в обе стороны", () => {
    expect(shiftSchoolDay("2026-10-17", 1)).toBe("2026-10-19");
    expect(shiftSchoolDay("2026-10-19", -1)).toBe("2026-10-17");
    expect(shiftSchoolDay("2026-10-14", 1)).toBe("2026-10-15");
  });
});

describe("formatWeekRange", () => {
  it("один месяц и стык месяцев", () => {
    expect(formatWeekRange("2026-10-12")).toBe("12–17 октября");
    expect(formatWeekRange("2026-09-28")).toBe("28 сентября – 3 октября");
  });
});

describe("weekIsAvailable", () => {
  it("пустой или неизвестный список не запрещает, иначе — только недели из списка", () => {
    expect(weekIsAvailable(undefined, "2026-10-12")).toBe(true);
    expect(weekIsAvailable([], "2026-10-12")).toBe(true);
    expect(weekIsAvailable(["2026-10-12"], "2026-10-12")).toBe(true);
    expect(weekIsAvailable(["2026-10-12"], "2026-10-19")).toBe(false);
  });
});

describe("relativeDayLabel", () => {
  it("сегодня, завтра, вчера, иначе пусто", () => {
    expect(relativeDayLabel("2026-10-15", "2026-10-15")).toBe("сегодня");
    expect(relativeDayLabel("2026-10-16", "2026-10-15")).toBe("завтра");
    expect(relativeDayLabel("2026-10-14", "2026-10-15")).toBe("вчера");
    expect(relativeDayLabel("2026-10-19", "2026-10-15")).toBeNull();
  });
});

describe("formatMonth", () => {
  it("месяц в именительном падеже", () => {
    expect(formatMonth("2026-10-15")).toBe("октябрь");
  });
});

describe("formatTaskCount", () => {
  it("склоняет по числу", () => {
    expect(formatTaskCount(0)).toBe("заданий нет");
    expect(formatTaskCount(1)).toBe("1 задание");
    expect(formatTaskCount(3)).toBe("3 задания");
    expect(formatTaskCount(5)).toBe("5 заданий");
    expect(formatTaskCount(11)).toBe("11 заданий");
    expect(formatTaskCount(22)).toBe("22 задания");
  });
});

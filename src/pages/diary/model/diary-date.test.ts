import { describe, expect, it } from "vitest";
import {
  formatWeekRange,
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

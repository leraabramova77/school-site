import { describe, expect, it } from "vitest";
import { formatLessonTime } from "./lesson";

describe("formatLessonTime", () => {
  it("интервал, только начало или пусто", () => {
    expect(formatLessonTime({ start: "8:30", end: "9:10" })).toBe("8:30–9:10");
    expect(formatLessonTime({ start: "8:30" })).toBe("8:30");
    expect(formatLessonTime({})).toBe("");
  });
});

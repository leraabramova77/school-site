import { describe, expect, it } from "vitest";
import { gradeAriaLabel, gradeLabel, gradeTone } from "./grade";

describe("отметки", () => {
  it("цвет: 5/4/3/2, единица — как двойка, долг отдельно", () => {
    expect([5, 4, 3, 2, 1].map((m) => gradeTone(m as 1))).toEqual([
      "5",
      "4",
      "3",
      "2",
      "2",
    ]);
    expect(gradeTone("debt")).toBe("debt");
  });

  it("на чипе всегда текст", () => {
    expect(gradeLabel(4)).toBe("4");
    expect(gradeLabel("debt")).toBe("Долг");
  });

  it("подпись для скринридера", () => {
    expect(gradeAriaLabel({ mark: 5 })).toBe("Оценка 5");
    expect(
      gradeAriaLabel({ mark: 3, weight: 10, workType: "Контрольная работа" }),
    ).toBe("Оценка 3, вес 10, контрольная работа");
    expect(gradeAriaLabel({ mark: "debt" })).toBe("Долг");
  });
});

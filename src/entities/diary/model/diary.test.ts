import { describe, expect, it } from "vitest";
import type { DiaryItem } from "@/shared/netschool";
import {
  daysWithMarks,
  subjectTone,
  toDiaryWeekView,
  workTypeLabel,
} from "./diary";

// Выдуманные задания.
const item = (over: Partial<DiaryItem>): DiaryItem => ({
  date: "2026-10-12",
  subject: "Алгебра",
  typeCode: "Д",
  theme: "№ 1",
  weight: 1,
  mark: null,
  markRaw: null,
  assignment: null,
  ...over,
});

describe("toDiaryWeekView", () => {
  it("группирует по дням по порядку, точку считает долгом", () => {
    const view = toDiaryWeekView({
      items: [
        item({ date: "2026-10-13", subject: "Физика", markRaw: "." }),
        item({
          mark: 5,
          typeCode: "К",
          assignment: { aid: "1", cid: "2", tp: "3" },
        }),
      ],
      weeks: ["2026-10-12"],
      selectedWeek: "2026-10-12",
      pclid: "111_0",
    });
    expect(view.monday).toBe("2026-10-12");
    expect(view.days.map((d) => d.date)).toEqual(["2026-10-12", "2026-10-13"]);
    expect(view.days[0]?.entries[0]).toMatchObject({
      id: "1-3",
      mark: 5,
      isHomework: false,
    });
    expect(view.days[1]?.entries[0]).toMatchObject({
      subject: "Физика",
      mark: "debt",
      isHomework: true,
    });
  });

  it("в результате нет служебного PCLID", () => {
    const view = toDiaryWeekView({
      items: [],
      weeks: [],
      selectedWeek: null,
      pclid: "111_0",
    });
    expect(JSON.stringify(view)).not.toContain("111_0");
  });
});

describe("workTypeLabel", () => {
  it("расшифровывает известный код, незнакомый — «Задание»", () => {
    expect(workTypeLabel("Д")).toBe("Домашнее задание");
    expect(workTypeLabel("_П")).toBe("Задание");
  });
});

describe("daysWithMarks", () => {
  it("отмечает только дни с отметками или долгами", () => {
    const entry = {
      id: "1",
      subject: "Алгебра",
      typeCode: "О",
      isHomework: false,
      text: "",
      weight: null,
      assignment: null,
    };
    expect(
      daysWithMarks({
        monday: "2026-10-12",
        weeks: [],
        days: [
          { date: "2026-10-12", entries: [{ ...entry, mark: null }] },
          { date: "2026-10-13", entries: [{ ...entry, mark: "debt" }] },
          { date: "2026-10-14", entries: [{ ...entry, mark: 5 }] },
        ],
      }),
    ).toEqual(["2026-10-13", "2026-10-14"]);
  });
});

describe("subjectTone", () => {
  it("постоянный для предмета и в пределах палитры", () => {
    expect(subjectTone("Алгебра")).toBe(subjectTone(" алгебра "));
    for (const s of ["Алгебра", "История", "Физика", "Русский язык"]) {
      expect(subjectTone(s)).toBeGreaterThanOrEqual(0);
      expect(subjectTone(s)).toBeLessThan(8);
    }
  });
});

import { describe, expect, it } from "vitest";
import type { DiaryItem } from "@/shared/netschool";
import { toDiaryWeekView } from "./diary";

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

import { describe, expect, it } from "vitest";
import { nextCheckAt, type WatchEntry, watchVerdict } from "./session-watch";

const min = 60_000;

describe("замер сессии", () => {
  it("паузы растут: 5, 10, 20… минут от последней проверки", () => {
    const log: WatchEntry[] = [{ at: 0, alive: true, idleMin: 0 }];
    expect(nextCheckAt(log)).toBe(5 * min);
    log.push({ at: 5 * min, alive: true, idleMin: 5 });
    expect(nextCheckAt(log)).toBe(15 * min);
  });

  it("сессия умерла — проверок больше нет, есть итог", () => {
    const log: WatchEntry[] = [
      { at: 0, alive: true, idleMin: 0 },
      { at: 5 * min, alive: true, idleMin: 5 },
      { at: 15 * min, alive: true, idleMin: 10 },
      { at: 35 * min, alive: false, idleMin: 20 },
    ];
    expect(nextCheckAt(log)).toBeNull();
    expect(watchVerdict(log)).toBe(
      "Сессия netschool живёт без запросов больше 10 мин, но меньше 20 мин.",
    );
  });

  it("пустой журнал — ни проверки, ни итога", () => {
    expect(nextCheckAt([])).toBeNull();
    expect(watchVerdict([])).toBeNull();
  });
});

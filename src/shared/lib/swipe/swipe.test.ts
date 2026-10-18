import { describe, expect, it } from "vitest";
import { swipeDirection } from "./swipe";

describe("swipeDirection", () => {
  it("влево и вправо — при уверенном горизонтальном движении", () => {
    expect(swipeDirection(-80, 10)).toBe("left");
    expect(swipeDirection(90, -20)).toBe("right");
  });

  it("короткое или диагональное движение — не свайп", () => {
    expect(swipeDirection(30, 0)).toBeNull();
    expect(swipeDirection(80, 70)).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("поздний класс перебивает ранний", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("bg-surface", false, "bg-accent")).toBe("bg-accent");
  });

  it("размер текста из шкалы не конфликтует с цветом", () => {
    expect(cn("text-footnote", "text-accent")).toBe(
      "text-footnote text-accent",
    );
    expect(cn("text-body", "text-title-3")).toBe("text-title-3");
  });

  it("rounded-card — скругление", () => {
    expect(cn("rounded-xl", "rounded-card")).toBe("rounded-card");
  });
});

import { describe, expect, it } from "vitest";
import { buttonVariants } from "./Button";

describe("buttonVariants", () => {
  it("каждый размер даёт зону нажатия не меньше 44 px", () => {
    for (const size of ["md", "sm", "lg", "icon"] as const) {
      expect(buttonVariants({ size })).toMatch(/\b(h-11|h-12|size-11)\b/);
    }
  });

  it("по умолчанию — основная кнопка в цвете акцента", () => {
    expect(buttonVariants()).toContain("bg-accent text-accent-fg");
  });
});

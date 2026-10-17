import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  isInSrgbGamut,
  linearRgbToHex,
  oklchToLinearRgb,
  parseOklch,
} from "./oklch";

const rgb = (css: string) => oklchToLinearRgb(parseOklch(css));

describe("oklch", () => {
  it("разбирает oklch(L C H)", () => {
    expect(parseOklch("oklch(0.52 0.16 256)")).toEqual({
      l: 0.52,
      c: 0.16,
      h: 256,
    });
    expect(() => parseOklch("#fff")).toThrow();
  });

  it("переводит опорные цвета в hex", () => {
    expect(linearRgbToHex(rgb("oklch(1 0 0)"))).toBe("#ffffff");
    expect(linearRgbToHex(rgb("oklch(0 0 0)"))).toBe("#000000");
    // Чистый красный sRGB в OKLCH ≈ (0.628, 0.2577, 29.23).
    expect(linearRgbToHex(rgb("oklch(0.62796 0.25768 29.2339)"))).toBe(
      "#ff0000",
    );
  });

  it("считает контраст по WCAG", () => {
    expect(contrastRatio(rgb("oklch(1 0 0)"), rgb("oklch(0 0 0)"))).toBeCloseTo(
      21,
      1,
    );
    expect(
      contrastRatio(rgb("oklch(0.5 0 0)"), rgb("oklch(0.5 0 0)")),
    ).toBeCloseTo(1, 5);
  });

  it("находит цвета вне sRGB", () => {
    expect(isInSrgbGamut(rgb("oklch(0.7 0.1 150)"))).toBe(true);
    expect(isInSrgbGamut(rgb("oklch(0.9 0.4 150)"))).toBe(false);
  });
});

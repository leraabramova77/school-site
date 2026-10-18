import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { themeColor } from "@/shared/config";
import {
  contrastRatio,
  isInSrgbGamut,
  type LinearRgb,
  linearRgbToHex,
  oklchToLinearRgb,
  parseOklch,
} from "@/shared/lib/color";

const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

/** Токены одного блока `selector { --name: oklch(...); }` из globals.css. */
function tokens(selector: string): Record<string, LinearRgb> {
  const start = css.indexOf(`\n${selector} {`);
  if (start === -1) throw new Error(`Нет блока ${selector}`);
  const block = css.slice(start, css.indexOf("\n}", start));
  const result: Record<string, LinearRgb> = {};
  for (const [, name, value] of block.matchAll(
    /--([\w-]+):\s*(oklch\([^)]*\));/g,
  ))
    result[name] = oklchToLinearRgb(parseOklch(value));
  return result;
}

const grades = ["5", "4", "3", "2", "debt"];
const surfaces = ["bg", "surface", "surface-2"];
const subjects = Array.from({ length: 8 }, (_, i) => `subject-${i}`);

/** Пары «текст — фон», которые встречаются в интерфейсе. WCAG AA для обычного текста — 4.5:1. */
const textPairs: [string, string][] = [
  ...surfaces.flatMap((s): [string, string][] => [
    ["text", s],
    ["text-muted", s],
    ["accent", s],
  ]),
  ["accent-fg", "accent"],
  ...grades.flatMap((g): [string, string][] => [
    [`grade-${g}`, `grade-${g}-soft`],
    [`grade-${g}`, "surface"],
    ["grade-fg", `grade-${g}`],
  ]),
  ...subjects.map((s): [string, string] => [s, "surface"]),
];

const themes = [
  { name: "светлая", selector: ":root", color: themeColor.light },
  { name: "тёмная", selector: ".dark", color: themeColor.dark },
];

describe.each(themes)("тема $name", ({ selector, color }) => {
  const t = tokens(selector);

  it("определяет одинаковый набор токенов в обеих темах", () => {
    expect(Object.keys(t).sort()).toEqual(Object.keys(tokens(":root")).sort());
  });

  it("все цвета внутри sRGB", () => {
    const outside = Object.entries(t)
      .filter(([, rgb]) => !isInSrgbGamut(rgb))
      .map(([name]) => name);
    expect(outside).toEqual([]);
  });

  it.each(textPairs)("контраст %s на %s ≥ 4.5", (fg, bg) => {
    expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it("theme-color совпадает с --bg", () => {
    expect(color).toBe(linearRgbToHex(t.bg));
  });
});

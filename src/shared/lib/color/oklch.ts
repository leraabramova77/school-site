// Перевод OKLCH → sRGB и контраст по WCAG 2. Нужен, чтобы проверять дизайн-токены тестами,
// без зависимости от браузера. Формулы — https://bottosson.github.io/posts/oklab/ и WCAG 2.2, «relative luminance».

export type Oklch = { l: number; c: number; h: number };

/** Линейный sRGB, каждый канал 0..1 (вне гамута — может выйти за границы). */
export type LinearRgb = [number, number, number];

const OKLCH_RE = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/;

export function parseOklch(value: string): Oklch {
  const m = OKLCH_RE.exec(value.trim());
  if (!m) throw new Error(`Не OKLCH: ${value}`);
  return { l: Number(m[1]), c: Number(m[2]), h: Number(m[3]) };
}

export function oklchToLinearRgb({ l, c, h }: Oklch): LinearRgb {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);
  const l1 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m1 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s1 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l1 - 3.3077115913 * m1 + 0.2309699292 * s1,
    -1.2684380046 * l1 + 2.6097574011 * m1 - 0.3413193965 * s1,
    -0.0041960863 * l1 - 0.7034186147 * m1 + 1.707614701 * s1,
  ];
}

/** Цвет помещается в sRGB (с допуском на округление). */
export function isInSrgbGamut(rgb: LinearRgb, eps = 1e-3): boolean {
  return rgb.every((v) => v >= -eps && v <= 1 + eps);
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function relativeLuminance(rgb: LinearRgb): number {
  const [r, g, b] = rgb.map(clamp) as LinearRgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: LinearRgb, b: LinearRgb): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (hi + 0.05) / (lo + 0.05);
}

export function linearRgbToHex(rgb: LinearRgb): string {
  const encode = (v: number) => {
    const x = clamp(v);
    const srgb = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
    return Math.round(srgb * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${rgb.map(encode).join("")}`;
}

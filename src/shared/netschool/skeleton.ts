import { HTMLElement, type Node, parse, TextNode } from "node-html-parser";

/*
 * «Скелет» HTML для отладки разбора: теги и структура остаются, данные — нет. Текст заменяется на маску
 * (цифры → 9, буквы → x), у атрибутов сохраняются только имена и безопасные значения (class, type, name, rowspan).
 * Скрипты и стили вырезаются целиком. Так можно разбирать устройство страниц с реальными оценками, не видя их.
 */

const KEEP_ATTRS = new Set([
  "class",
  "type",
  "name",
  "rowspan",
  "colspan",
  "method",
  "action",
  "bgcolor",
]);

export function maskText(text: string): string {
  return text.replace(/\p{N}/gu, "9").replace(/\p{L}/gu, "x");
}

function walk(node: Node): void {
  for (const child of [...node.childNodes]) {
    if (child instanceof TextNode) {
      child.rawText = maskText(child.rawText);
    } else if (child instanceof HTMLElement) {
      if (child.tagName === "SCRIPT" || child.tagName === "STYLE") {
        child.set_content("…");
        continue;
      }
      for (const [name, value] of Object.entries(child.attributes)) {
        child.setAttribute(
          name,
          KEEP_ATTRS.has(name.toLowerCase()) ? value : maskText(value),
        );
      }
      walk(child);
    }
  }
}

export function htmlSkeleton(html: string): string {
  const root = parse(html, { comment: false });
  walk(root);
  return root.toString();
}

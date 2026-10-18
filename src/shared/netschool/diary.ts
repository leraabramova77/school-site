import { parse } from "node-html-parser";
import { z } from "zod";

/*
 * Разбор дневника (`/asp/Curriculum/Assignments.asp`, docs/api-map.md §3). Чистая функция без сети: тестируется на
 * выдуманных HTML-фикстурах. Строки заданий — `tr[bgcolor]`; ячейка даты `td.hidden-scr-sm` с rowspan стоит только
 * в первой строке дня, остальные строки дня её не имеют.
 */

const mark = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const diaryItemSchema = z.object({
  /** YYYY-MM-DD */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  subject: z.string().min(1),
  /** Код типа задания сайта: `Д`, `К`, `_П`… */
  typeCode: z.string(),
  theme: z.string(),
  weight: z.number().nullable(),
  mark: mark.nullable(),
  /** Отметка, которую не удалось понять как 1–5 (точка-долг и т. п.) — для разбора, не для показа. */
  markRaw: z.string().nullable(),
  /** Ссылка на подробности задания: SubmAssign(AID, CID, TP). */
  assignment: z
    .object({ aid: z.string(), cid: z.string(), tp: z.string() })
    .nullable(),
});

export type DiaryItem = z.infer<typeof diaryItemSchema>;

export type DiaryWeek = {
  items: DiaryItem[];
  /** Понедельники доступных недель (`<select name="DATE">`), YYYY-MM-DD. */
  weeks: string[];
  /** Выбранная неделя. */
  selectedWeek: string | null;
  /** `PCLID_IUP` — нужен для запроса другой недели. */
  pclid: string | null;
};

/** `12.10.26` или `7.09.26` → `2026-10-12`. */
export function parseSiteDate(text: string): string | null {
  const m = /(\d{1,2})\.(\d{2})\.(\d{2})/.exec(text);
  if (!m) return null;
  return `20${m[3]}-${m[2]}-${m[1]?.padStart(2, "0")}`;
}

/** `2026-10-12` → `12.10.26` — формат поля `DATE`. */
export function toSiteDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y?.slice(2)}`;
}

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

export function parseDiary(html: string): DiaryWeek {
  const root = parse(html);
  const table =
    root.querySelector("table.table-thin") ?? root.querySelector("table.table");
  const items: DiaryItem[] = [];
  let date: string | null = null;

  for (const row of table?.querySelectorAll("tr[bgcolor]") ?? []) {
    const cells = row.querySelectorAll("td");
    const dayCell = cells.find((c) => c.classList.contains("hidden-scr-sm"));
    if (dayCell) date = parseSiteDate(dayCell.text);
    const rest = cells.filter((c) => c !== dayCell);
    if (!date || rest.length < 5) continue;
    const [subject, type, themeCell, weight, markCell] = rest;
    const link = themeCell?.querySelector("a");
    const ids = /SubmAssign\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/.exec(
      link?.getAttribute("href") ?? link?.getAttribute("onclick") ?? "",
    );
    const markText = clean(markCell?.text ?? "");
    const markNum = /^[1-5]$/.test(markText) ? Number(markText) : null;
    const weightNum = Number.parseFloat(
      clean(weight?.text ?? "").replace(",", "."),
    );
    items.push(
      diaryItemSchema.parse({
        date,
        subject: clean(subject?.text ?? ""),
        typeCode: clean(type?.text ?? ""),
        theme: clean(themeCell?.text ?? ""),
        weight: Number.isFinite(weightNum) ? weightNum : null,
        mark: markNum,
        markRaw:
          markNum === null && markText && markText !== "-" ? markText : null,
        assignment: ids
          ? { aid: ids[1] ?? "", cid: ids[2] ?? "", tp: ids[3] ?? "" }
          : null,
      }),
    );
  }

  const select = root.querySelector('select[name="DATE"]');
  const weeks = (select?.querySelectorAll("option") ?? [])
    .map((o) => parseSiteDate(o.getAttribute("value") ?? ""))
    .filter((d): d is string => d !== null);
  const selectedOption = select?.querySelector("option[selected]");
  const pclid =
    root.querySelector('input[name="PCLID_IUP"]')?.getAttribute("value") ??
    root
      .querySelector('select[name="PCLID_IUP"] option[selected]')
      ?.getAttribute("value") ??
    root
      .querySelector('select[name="PCLID_IUP"] option')
      ?.getAttribute("value") ??
    null;

  return {
    items,
    weeks,
    selectedWeek: selectedOption
      ? parseSiteDate(selectedOption.getAttribute("value") ?? "")
      : null,
    pclid,
  };
}

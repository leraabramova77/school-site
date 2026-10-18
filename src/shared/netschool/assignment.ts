import { parse } from "node-html-parser";
import { z } from "zod";
import { NetschoolError } from "./errors";

/*
 * Подробности задания (`GetAssignmentInfo.asp`, docs/api-map.md §3.1). Ответ — JSON, внутри `strTable` — HTML-таблица
 * «заголовок → значение». Значения возвращаем как HTML БЕЗ очистки: очищать обязан тот, кто отдаёт их клиенту.
 */

const responseSchema = z.object({
  data: z.object({
    strTitle: z.string().nullish(),
    strTable: z.string(),
  }),
  isError: z.boolean().optional(),
});

export type AssignmentRef = { aid: string; cid: string; tp: string };

export type AssignmentInfo = {
  title: string | null;
  /** Строки таблицы: «Домашнее задание», «Срок сдачи», «Подробности от учителя»… Значение — сырой HTML. */
  rows: { label: string; rawHtml: string }[];
};

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

export function parseAssignmentInfo(text: string): AssignmentInfo {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new NetschoolError("unexpected_response");
  }
  const parsed = responseSchema.safeParse(json);
  if (!parsed.success || parsed.data.isError) {
    throw new NetschoolError("unexpected_response");
  }
  const rows: AssignmentInfo["rows"] = [];
  for (const tr of parse(parsed.data.data.strTable).querySelectorAll("tr")) {
    const th = tr.querySelector("th");
    const td = tr.querySelector("td");
    if (!th || !td) continue;
    const label = clean(th.text).replace(/:$/, "");
    if (label) rows.push({ label, rawHtml: td.innerHTML.trim() });
  }
  const title = parsed.data.data.strTitle
    ? clean(parsed.data.data.strTitle).replace(/^Информация о задании:\s*/, "")
    : null;
  return { title: title || null, rows };
}

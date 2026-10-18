import "server-only";
import { type DiaryWeek, parseDiary, toSiteDate } from "./diary";
import { type NetschoolResponse, netschoolRequest } from "./http.server";
import type { NetschoolSession } from "./login.server";

const ver = () => String(Date.now());

export type DiaryResult = { week: DiaryWeek; raw: NetschoolResponse };

/**
 * Дневник недели. Без `monday` — текущая неделя. Для другой недели сайту нужен `PCLID_IUP`: берём его из ответа
 * на текущую неделю (лишний запрос только в этом случае).
 */
export async function fetchDiaryWeek(
  session: NetschoolSession,
  monday?: string,
): Promise<DiaryResult> {
  const base = { LoginType: "0", AT: session.at, VER: ver() };
  const path = "/asp/Curriculum/Assignments.asp";
  let raw = await netschoolRequest(session.cookies, path, {
    method: "POST",
    retry: true,
    form: base,
  });
  let week = parseDiary(raw.html);
  if (monday && week.selectedWeek !== monday && week.pclid) {
    raw = await netschoolRequest(session.cookies, path, {
      method: "POST",
      retry: true,
      form: {
        ...base,
        VER: ver(),
        DATE: toSiteDate(monday),
        PCLID_IUP: week.pclid,
      },
    });
    week = parseDiary(raw.html);
  }
  return { week, raw };
}

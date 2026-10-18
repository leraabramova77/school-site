import "server-only";
import { type DiaryWeek, parseDiary, toSiteDate } from "./diary";
import { type NetschoolResponse, netschoolRequest } from "./http.server";
import type { NetschoolSession } from "./login.server";

const ver = () => String(Date.now());

export type DiaryResult = { week: DiaryWeek; raw: NetschoolResponse };

/**
 * Дневник недели. Без `monday` — текущая неделя. Для другой недели сайту нужен `PCLID_IUP`: если он уже известен
 * (из сессии) — один запрос, иначе сначала берём его из текущей недели.
 */
export async function fetchDiaryWeek(
  session: NetschoolSession,
  monday?: string,
  knownPclid?: string,
): Promise<DiaryResult> {
  const path = "/asp/Curriculum/Assignments.asp";
  const base = () => ({ LoginType: "0", AT: session.at, VER: ver() });
  const request = (form: Record<string, string>) =>
    netschoolRequest(session.cookies, path, {
      method: "POST",
      retry: true,
      form,
    });

  if (monday && knownPclid) {
    const raw = await request({
      ...base(),
      DATE: toSiteDate(monday),
      PCLID_IUP: knownPclid,
    });
    return { week: parseDiary(raw.html), raw };
  }

  let raw = await request(base());
  let week = parseDiary(raw.html);
  if (monday && week.selectedWeek !== monday && week.pclid) {
    raw = await request({
      ...base(),
      DATE: toSiteDate(monday),
      PCLID_IUP: week.pclid,
    });
    week = parseDiary(raw.html);
  }
  return { week, raw };
}

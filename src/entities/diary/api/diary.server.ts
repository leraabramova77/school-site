import "server-only";
import { z } from "zod";
import { startOfWeek } from "@/shared/lib/date";
import { sanitizeHtml } from "@/shared/lib/sanitize";
import { fetchAssignmentInfo, fetchDiaryWeek } from "@/shared/netschool";
import { NO_STORE } from "@/shared/server";
import { respondWithSession } from "@/shared/session";
import {
  type AssignmentView,
  type DiaryWeekView,
  toDiaryWeekView,
} from "../model/diary";

/*
 * API дневника (ТЗ-1, этап 5). Все входные параметры — через Zod; ответы — `no-store`, только данные для экрана.
 */

const weekQuery = z.object({
  week: z.iso.date().optional(),
});

const assignmentQuery = z.object({
  aid: z.string().regex(/^\d{1,12}$/),
  cid: z.string().regex(/^\d{1,12}$/),
  tp: z.string().regex(/^\d{1,4}$/),
});

function badRequest(error: string): Response {
  return Response.json(
    { ok: false, error },
    { status: 400, headers: NO_STORE },
  );
}

/** `GET /api/diary?week=YYYY-MM-DD` — неделя, в которую попадает дата; без `week` — текущая. */
export async function diaryHandler(request: Request): Promise<Response> {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const query = weekQuery.safeParse(params);
  if (!query.success) return badRequest("Неверная дата недели");
  const monday = query.data.week ? startOfWeek(query.data.week) : undefined;

  return respondWithSession<DiaryWeekView>("diary_failed", async (session) => {
    const { week } = await fetchDiaryWeek(session.ns, monday, session.pclid);
    return {
      data: toDiaryWeekView(week),
      remember: week.pclid ? { pclid: week.pclid } : undefined,
    };
  });
}

/** `GET /api/assignment?aid=&cid=&tp=` — подробности задания, HTML учителя очищен. */
export async function assignmentHandler(request: Request): Promise<Response> {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const query = assignmentQuery.safeParse(params);
  if (!query.success) return badRequest("Неверная ссылка на задание");

  return respondWithSession<AssignmentView>(
    "assignment_failed",
    async (session) => {
      let pclid = session.pclid;
      if (!pclid) {
        // Класс ещё не известен (дневник не открывали) — берём его из текущей недели.
        pclid = (await fetchDiaryWeek(session.ns)).week.pclid ?? undefined;
      }
      if (!pclid) throw new Error("PCLID не найден");
      const info = await fetchAssignmentInfo(session.ns, query.data, pclid);
      return {
        data: {
          title: info.title,
          rows: info.rows.map((r) => ({
            label: r.label,
            html: sanitizeHtml(r.rawHtml),
          })),
        },
        remember: { pclid },
      };
    },
  );
}

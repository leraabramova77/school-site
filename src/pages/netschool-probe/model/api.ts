import type { DiaryWeek } from "@/shared/netschool";

export const PROBE_API = "/api/dev/netschool-probe";

export type ProbeOk = {
  ok: true;
  durationMs: number;
  cookieNames: string[];
  sessionAgeMin: number;
  idleMin: number;
  week: DiaryWeek;
};

export type ProbeResult =
  | ProbeOk
  | { ok?: false; error: string; code?: string };

export type ResumeResult =
  | ProbeResult
  | { ok?: false; needLogin: true; expiredAfterIdleMin?: number };

/** Загрузка недели по сохранённой сессии (продлевает сессию netschool). */
export async function resume(): Promise<ResumeResult> {
  try {
    return (await (await fetch(PROBE_API)).json()) as ResumeResult;
  } catch {
    return { error: "Наш сервер не ответил" };
  }
}

export async function logout(): Promise<void> {
  await fetch(PROBE_API, { method: "DELETE" }).catch(() => undefined);
}

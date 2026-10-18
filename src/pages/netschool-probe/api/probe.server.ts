import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  fetchDiaryWeek,
  htmlSkeleton,
  loginToNetschool,
  NetschoolError,
  type NetschoolSession,
} from "@/shared/netschool";
import { logger } from "@/shared/server";
import {
  clearSession,
  readSession,
  type SessionData,
  writeSession,
} from "@/shared/session";

/*
 * Отладка на реальных данных — только `pnpm dev` на компьютере разработчика. В сборке для прода — 404.
 * Логин и пароль идут только в netschool и нигде не сохраняются; сессия netschool — в зашифрованной cookie.
 * На диск (папка `debug/`, в .gitignore) пишутся лишь скелеты страниц: структура тегов без текста и значений.
 */

const DEBUG_DIR = path.join(process.cwd(), "debug", "netschool");

async function saveSkeleton(name: string, html: string): Promise<void> {
  await mkdir(DEBUG_DIR, { recursive: true });
  await writeFile(
    path.join(DEBUG_DIR, `${name}.html`),
    htmlSkeleton(html),
    "utf8",
  );
}

function guard(request: Request): Response | null {
  if (process.env.NODE_ENV !== "development")
    return new Response(null, { status: 404 });
  if (request.method === "GET") return null;
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).host !== request.headers.get("host")) {
    return Response.json({ error: "Чужой источник запроса" }, { status: 403 });
  }
  return null;
}

function errorResponse(error: unknown): Response {
  if (error instanceof NetschoolError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: 502 },
    );
  }
  logger.error("netschool_probe_failed", { code: "unexpected" }, error);
  return Response.json(
    { error: "Неожиданная ошибка — смотри лог сервера", code: "unexpected" },
    { status: 500 },
  );
}

/** Загружает неделю и обновляет cookie: netschool мог выдать новые cookie, а время использования сдвигается. */
async function loadWeek(
  ns: NetschoolSession,
  createdAt: number,
  lastUsedAt = createdAt,
) {
  const started = performance.now();
  const { week, raw } = await fetchDiaryWeek(ns);
  await saveSkeleton("diary", raw.html);
  const now = Date.now();
  await writeSession({ ns, createdAt, lastUsedAt: now });
  return Response.json({
    ok: true,
    durationMs: Math.round(performance.now() - started),
    cookieNames: Object.keys(ns.cookies),
    sessionAgeMin: Math.round((now - createdAt) / 60_000),
    /** Сколько минут перед этим запросом сессия простаивала. */
    idleMin: Math.round((now - lastUsedAt) / 60_000),
    week,
  });
}

/** Вход по логину и паролю. */
export async function probeLogin(request: Request): Promise<Response> {
  const blocked = guard(request);
  if (blocked) return blocked;

  const body = (await request.json().catch(() => null)) as {
    login?: unknown;
    password?: unknown;
  } | null;
  const login = typeof body?.login === "string" ? body.login.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!login || !password)
    return Response.json({ error: "Введи логин и пароль" }, { status: 400 });

  try {
    const { session, postlogin } = await loginToNetschool(login, password);
    await saveSkeleton("postlogin", postlogin.html);
    return await loadWeek(session, Date.now());
  } catch (error) {
    return errorResponse(error);
  }
}

/** Автозагрузка по сохранённой сессии. Нет сессии или она умерла у netschool → 401, нужен вход. */
export async function probeResume(request: Request): Promise<Response> {
  const blocked = guard(request);
  if (blocked) return blocked;

  const saved: SessionData | null = await readSession();
  if (!saved) return Response.json({ needLogin: true }, { status: 401 });
  try {
    return await loadWeek(saved.ns, saved.createdAt, saved.lastUsedAt);
  } catch (error) {
    if (error instanceof NetschoolError && error.code === "session_expired") {
      await clearSession();
      // Замер для docs/api-map.md: сколько сессия netschool живёт без запросов.
      const idleMin = Math.round((Date.now() - saved.lastUsedAt) / 60_000);
      logger.info("netschool_session_expired", {
        code: `idle_${idleMin}_min`,
      });
      return Response.json(
        { needLogin: true, expiredAfterIdleMin: idleMin },
        { status: 401 },
      );
    }
    return errorResponse(error);
  }
}

/** Выход: удаляем нашу cookie. */
export async function probeLogout(request: Request): Promise<Response> {
  const blocked = guard(request);
  if (blocked) return blocked;
  await clearSession();
  return new Response(null, { status: 204 });
}

import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  fetchDiaryWeek,
  htmlSkeleton,
  loginToNetschool,
  NetschoolError,
} from "@/shared/netschool";
import { logger } from "@/shared/server";

/*
 * Отладка на реальных данных — только `pnpm dev` на компьютере разработчика. В сборке для прода — 404.
 * Логин и пароль идут только в netschool и нигде не сохраняются. На диск (папка `debug/`, в .gitignore) пишутся
 * лишь скелеты страниц: структура тегов без текста и значений — по ним дорабатывается разбор.
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

export async function probeHandler(request: Request): Promise<Response> {
  if (process.env.NODE_ENV !== "development")
    return new Response(null, { status: 404 });
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).host !== request.headers.get("host")) {
    return Response.json({ error: "Чужой источник запроса" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    login?: unknown;
    password?: unknown;
  } | null;
  const login = typeof body?.login === "string" ? body.login.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!login || !password)
    return Response.json({ error: "Введи логин и пароль" }, { status: 400 });

  const started = performance.now();
  try {
    const { session, postlogin } = await loginToNetschool(login, password);
    await saveSkeleton("postlogin", postlogin.html);
    const { week, raw } = await fetchDiaryWeek(session);
    await saveSkeleton("diary", raw.html);
    return Response.json({
      ok: true,
      durationMs: Math.round(performance.now() - started),
      cookieNames: Object.keys(session.cookies),
      week,
    });
  } catch (error) {
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
}

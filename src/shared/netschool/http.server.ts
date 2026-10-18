import "server-only";
import { logger } from "@/shared/server";
import { NETSCHOOL_ORIGIN, REQUEST_TIMEOUT_MS } from "./config";
import { NetschoolError } from "./errors";

export type Fields = Record<string, string>;

/** Cookie старого сайта: имя → значение. Хранится в нашей зашифрованной сессии, в браузер не уходит. */
export type CookieJar = Record<string, string>;

export type NetschoolResponse = { status: number; html: string; url: string };

function cookieHeader(jar: CookieJar): string {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

/** Забирает `Set-Cookie` в банку (только имя=значение; срок и флаги нам не нужны). */
function storeCookies(jar: CookieJar, headers: Headers): void {
  for (const line of headers.getSetCookie()) {
    const pair = line.split(";", 1)[0] ?? "";
    const eq = pair.indexOf("=");
    if (eq > 0) jar[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
  }
}

/** Страница ошибки старого сайта = сессия недействительна (docs/api-map.md, «Общие правила»). */
function isErrorPage(url: string, html: string): boolean {
  return (
    /\/asp\/error\.asp/i.test(url) || /<title>\s*NetSchool\. Ошибка/i.test(html)
  );
}

type RequestOptions = {
  method: "GET" | "POST";
  form?: Fields;
  /** Повтор один раз при сетевой ошибке или 5xx. Вход не повторяем — лишняя попытка с паролем. */
  retry?: boolean;
};

/**
 * Запрос к старому сайту от имени ученика. Редиректы обходим вручную, чтобы забрать cookie с каждого шага и не уйти
 * на чужой хост. В лог — только метод, путь, статус и длительность.
 */
export async function netschoolRequest(
  jar: CookieJar,
  path: string,
  { method, form, retry = method === "GET" }: RequestOptions,
): Promise<NetschoolResponse> {
  const attempts = retry ? 2 : 1;
  for (let attempt = 1; ; attempt++) {
    const started = performance.now();
    try {
      const res = await send(jar, path, method, form);
      logger.info("netschool_request", {
        method,
        path,
        status: res.status,
        durationMs: performance.now() - started,
      });
      if (res.status >= 500 && attempt < attempts) continue;
      if (res.status >= 500) throw new NetschoolError("unavailable");
      if (isErrorPage(res.url, res.html))
        throw new NetschoolError("session_expired");
      return res;
    } catch (error) {
      if (error instanceof NetschoolError) throw error;
      const timeout = error instanceof Error && error.name === "TimeoutError";
      logger.warn(
        "netschool_request_failed",
        {
          method,
          path,
          durationMs: performance.now() - started,
          code: timeout ? "timeout" : "network",
        },
        error,
      );
      if (attempt < attempts) continue;
      throw new NetschoolError(timeout ? "timeout" : "unavailable");
    }
  }
}

async function send(
  jar: CookieJar,
  path: string,
  method: "GET" | "POST",
  form: Fields | undefined,
): Promise<NetschoolResponse> {
  let url = new URL(path, NETSCHOOL_ORIGIN);
  let init: RequestInit = {
    method,
    redirect: "manual",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      ...(form && { "content-type": "application/x-www-form-urlencoded" }),
      "user-agent": "Mozilla/5.0 (compatible; school-diary-mirror)",
    },
    body: form ? new URLSearchParams(form).toString() : undefined,
  };
  for (let hop = 0; hop < 5; hop++) {
    const headers = new Headers(init.headers);
    if (Object.keys(jar).length) headers.set("cookie", cookieHeader(jar));
    const res = await fetch(url, { ...init, headers });
    storeCookies(jar, res.headers);
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      const next = new URL(location, url);
      if (next.origin !== NETSCHOOL_ORIGIN)
        throw new NetschoolError("unexpected_response");
      url = next;
      // После редиректа браузер делает GET без тела.
      init = {
        ...init,
        method: "GET",
        body: undefined,
        headers: { "user-agent": "Mozilla/5.0" },
      };
      continue;
    }
    return { status: res.status, html: await res.text(), url: url.toString() };
  }
  throw new NetschoolError("unexpected_response");
}

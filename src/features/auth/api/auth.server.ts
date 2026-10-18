import "server-only";
import { z } from "zod";
import { createMemoryRateLimiter } from "@/shared/lib/rate-limit";
import {
  loginToNetschool,
  logoutFromNetschool,
  NetschoolError,
  type NetschoolErrorCode,
} from "@/shared/netschool";
import { clientIp, isSameOrigin, logger, NO_STORE } from "@/shared/server";
import { clearSession, readSession, writeSession } from "@/shared/session";

/*
 * API входа и выхода (ТЗ-1 §4.1–4.4, этап 4). Пароль живёт только в памяти этого запроса: хеш → netschool → забыт.
 * Клиенту уходит только `{ ok }` или `{ ok: false, error }` — ни токена, ни cookie старого сайта, ни его ответов.
 */

/** 5 попыток входа за 10 минут с одного IP (ТЗ-1 §4.4). */
export const LOGIN_LIMIT = { limit: 5, windowMs: 10 * 60_000 };
const loginLimiter = createMemoryRateLimiter(LOGIN_LIMIT);

const loginSchema = z.object({
  login: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

export type AuthResponse = { ok: true } | { ok: false; error: string };

function reply(body: AuthResponse, status = 200, headers?: HeadersInit) {
  return Response.json(body, {
    status,
    headers: { ...NO_STORE, ...headers },
  });
}

const statusByCode: Record<NetschoolErrorCode, number> = {
  bad_credentials: 401,
  session_expired: 401,
  timeout: 504,
  unavailable: 502,
  unexpected_response: 502,
};

export async function loginHandler(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) {
    return reply({ ok: false, error: "Запрос не с нашего сайта" }, 403);
  }
  const limit = loginLimiter.hit(clientIp(request));
  if (!limit.ok) {
    logger.warn("login_rate_limited", { code: "rate_limited" });
    return reply(
      {
        ok: false,
        error: `Слишком много попыток. Попробуй через ${Math.ceil(limit.retryAfterSec / 60)} мин.`,
      },
      429,
      { "retry-after": String(limit.retryAfterSec) },
    );
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return reply({ ok: false, error: "Введи логин и пароль" }, 400);
  }

  try {
    const { session } = await loginToNetschool(
      parsed.data.login,
      parsed.data.password,
    );
    const now = Date.now();
    await writeSession({ ns: session, createdAt: now, lastUsedAt: now });
    logger.info("login_ok", { code: "login_ok" });
    return reply({ ok: true });
  } catch (error) {
    if (error instanceof NetschoolError) {
      logger.info("login_failed", { code: error.code });
      return reply(
        { ok: false, error: error.message },
        statusByCode[error.code],
      );
    }
    logger.error("login_failed", { code: "unexpected" }, error);
    return reply(
      { ok: false, error: "Что-то пошло не так. Попробуй ещё раз." },
      500,
    );
  }
}

export async function logoutHandler(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) {
    return reply({ ok: false, error: "Запрос не с нашего сайта" }, 403);
  }
  const saved = await readSession();
  if (saved) await logoutFromNetschool(saved.ns);
  await clearSession();
  return reply({ ok: true });
}

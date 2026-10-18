import "server-only";
import type { ApiResult } from "@/shared/api";
import { NetschoolError, type NetschoolErrorCode } from "@/shared/netschool";
import { logger, NO_STORE } from "@/shared/server";
import {
  clearSession,
  readSession,
  type SessionData,
  writeSession,
} from "./session.server";

const statusByCode: Record<NetschoolErrorCode, number> = {
  bad_credentials: 401,
  session_expired: 401,
  timeout: 504,
  unavailable: 502,
  unexpected_response: 502,
};

function json<T>(body: ApiResult<T>, status: number): Response {
  return Response.json(body, { status, headers: NO_STORE });
}

/**
 * Обёртка для API с личными данными (ТЗ-1 §4.2): достаёт сессию, вызывает netschool, продлевает cookie, отвечает
 * с `no-store`. Сессии нет или netschool её закрыл → удаляем cookie и отвечаем 401 `needLogin`.
 * `run` может вернуть `remember` — что сохранить в сессии (например, `pclid` класса).
 */
export async function respondWithSession<T>(
  event: string,
  run: (
    session: SessionData,
  ) => Promise<{ data: T; remember?: Pick<SessionData, "pclid"> }>,
): Promise<Response> {
  const session = await readSession();
  if (!session) {
    return json<T>({ ok: false, error: "Нужно войти", needLogin: true }, 401);
  }
  try {
    const { data, remember } = await run(session);
    await writeSession({ ...session, ...remember, lastUsedAt: Date.now() });
    return json({ ok: true, data }, 200);
  } catch (error) {
    if (error instanceof NetschoolError) {
      if (error.code === "session_expired") {
        await clearSession();
        return json<T>(
          { ok: false, error: error.message, needLogin: true },
          401,
        );
      }
      logger.warn(event, { code: error.code });
      return json<T>(
        { ok: false, error: error.message },
        statusByCode[error.code],
      );
    }
    logger.error(event, { code: "unexpected" }, error);
    return json<T>(
      { ok: false, error: "Что-то пошло не так. Попробуй ещё раз." },
      500,
    );
  }
}

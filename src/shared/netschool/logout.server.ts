import "server-only";
import { netschoolRequest } from "./http.server";
import type { NetschoolSession } from "./login.server";

/**
 * Выход на старом сайте (docs/api-map.md §1.5). Без повторов и без ошибок наружу: если сайт недоступен или сессия
 * уже умерла, нашу cookie всё равно удаляем — пользователь должен выйти в любом случае.
 */
export async function logoutFromNetschool(
  session: NetschoolSession,
): Promise<void> {
  try {
    await netschoolRequest(session.cookies, "/asp/logout.asp", {
      method: "POST",
      retry: false,
      form: { AT: session.at, VER: String(Date.now()) },
    });
  } catch {
    // Уже залогировано в netschoolRequest.
  }
}

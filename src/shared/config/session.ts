/**
 * Имя cookie сессии. `__Host-` требует Secure, а браузер не сохранит Secure-cookie, пришедшую по http с адреса
 * в локальной сети, поэтому префикс — только в проде (там всегда https). Отдельный модуль без `server-only`:
 * имя нужно и в `proxy.ts`, где серверные модули сессии не подключить.
 */
export function sessionCookieName(
  production = process.env.NODE_ENV === "production",
): string {
  return production ? "__Host-session" : "session";
}

/** Разделы, куда без входа не пускаем. */
export const PROTECTED_PATHS = [
  "/today",
  "/diary",
  "/grades",
  "/more",
] as const;

export const LOGIN_PATH = "/login";
export const HOME_PATH = "/today";

import "server-only";

/**
 * Защита от CSRF (ТЗ-1 §4.4): запрос, меняющий состояние, должен прийти с нашей же страницы — заголовок `Origin`
 * совпадает с хостом запроса. Нет `Origin` — отказ: все современные браузеры шлют его на POST.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const host =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** IP клиента для ограничения частоты. На Vercel первый адрес в `x-forwarded-for` ставит сама платформа. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0];
  return forwarded?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/** Заголовки для ответов с личными данными: никакого кэша ни в браузере, ни на CDN. */
export const NO_STORE = { "cache-control": "private, no-store" } as const;

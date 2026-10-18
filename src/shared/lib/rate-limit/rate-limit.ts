/*
 * Ограничение частоты: не больше `limit` попыток за `windowMs` на ключ (скользящее окно по отметкам времени).
 * Хранилище — память процесса: на одном сервере работает точно, на Vercel — в пределах одного экземпляра функции.
 * Для прода с несколькими экземплярами есть Upstash (подключается, когда будут ключи).
 */

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSec: number };

export type RateLimiter = { hit(key: string): RateLimitResult };

export function createMemoryRateLimiter({
  limit,
  windowMs,
  now = Date.now,
}: {
  limit: number;
  windowMs: number;
  now?: () => number;
}): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    hit(key) {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((at) => t - at < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        const oldest = recent[0] ?? t;
        return {
          ok: false,
          retryAfterSec: Math.ceil((oldest + windowMs - t) / 1000),
        };
      }
      recent.push(t);
      hits.set(key, recent);
      // Не копим ключи бесконечно: чистим пустые окна при каждом сотом ключе.
      if (hits.size % 100 === 0) {
        for (const [k, v] of hits) {
          if (v.every((at) => t - at >= windowMs)) hits.delete(k);
        }
      }
      return { ok: true, remaining: limit - recent.length };
    },
  };
}

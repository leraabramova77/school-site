/*
 * Замер срока жизни сессии netschool без запросов. Каждая проверка продлевает сессию, поэтому паузы между
 * проверками растут: 5, 10, 20, 40… минут. Первая пауза, после которой сессия умерла, даёт ответ:
 * срок — между предыдущей (пережитой) паузой и этой.
 */

export const IDLE_STEPS_MIN = [5, 10, 20, 40, 80, 160, 320] as const;

export type WatchEntry = {
  /** Время проверки, мс. */
  at: number;
  alive: boolean;
  /** Сколько минут перед этой проверкой не было запросов к netschool. 0 — первая отметка после входа. */
  idleMin: number;
};

/** Когда делать следующую проверку; `null` — замер не идёт или закончен. */
export function nextCheckAt(log: readonly WatchEntry[]): number | null {
  const last = log.at(-1);
  if (!last?.alive) return null;
  const step =
    IDLE_STEPS_MIN[Math.min(log.length - 1, IDLE_STEPS_MIN.length - 1)] ?? 320;
  return last.at + step * 60_000;
}

/** Итог замера человеческими словами или `null`, пока сессия жива. */
export function watchVerdict(log: readonly WatchEntry[]): string | null {
  const last = log.at(-1);
  if (!last || last.alive) return null;
  const survived = Math.max(
    0,
    ...log.filter((e) => e.alive).map((e) => e.idleMin),
  );
  return survived > 0
    ? `Сессия netschool живёт без запросов больше ${survived} мин, но меньше ${last.idleMin} мин.`
    : `Сессия netschool умерла уже после ${last.idleMin} мин без запросов.`;
}

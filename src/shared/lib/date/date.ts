/*
 * Даты дневника — строки ISO `YYYY-MM-DD` без времени и часового пояса. Внутри считаем в UTC, чтобы смещение
 * пояса браузера не сдвигало день.
 */

export type IsoDate = string;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function toUtc(date: IsoDate): Date {
  const m = ISO_DATE.exec(date);
  if (!m) throw new Error(`Ожидалась дата YYYY-MM-DD, получено: ${date}`);
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}

function fromUtc(d: Date): IsoDate {
  return d.toISOString().slice(0, 10);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const d = toUtc(date);
  d.setUTCDate(d.getUTCDate() + days);
  return fromUtc(d);
}

/** Понедельник недели, в которую попадает дата. */
export function startOfWeek(date: IsoDate): IsoDate {
  const weekday = (toUtc(date).getUTCDay() + 6) % 7; // Пн = 0 … Вс = 6
  return addDays(date, -weekday);
}

/** Учебные дни недели: Пн–Сб. */
export function schoolWeek(date: IsoDate): IsoDate[] {
  const monday = startOfWeek(date);
  return Array.from({ length: 6 }, (_, i) => addDays(monday, i));
}

/** Сегодняшняя дата по местному времени устройства. */
export function todayIso(now = new Date()): IsoDate {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const weekdayShort = new Intl.DateTimeFormat("ru-RU", {
  weekday: "short",
  timeZone: "UTC",
});
const dayLong = new Intl.DateTimeFormat("ru-RU", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** «Пн», «Вт», … */
export function formatWeekdayShort(date: IsoDate): string {
  const s = weekdayShort.format(toUtc(date)).replace(".", "");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Число месяца: «12». */
export function formatDayOfMonth(date: IsoDate): string {
  return String(toUtc(date).getUTCDate());
}

/** «понедельник, 12 октября» — для подписей и скринридеров. */
export function formatDayLong(date: IsoDate): string {
  return dayLong.format(toUtc(date));
}

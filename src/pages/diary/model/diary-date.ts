import { addDays, type IsoDate, startOfWeek } from "@/shared/lib/date";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isSunday(date: IsoDate): boolean {
  return addDays(startOfWeek(date), 6) === date;
}

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value)
  );
}

/**
 * День из адреса `?date=`: неверный или пустой — сегодня. Воскресенье — понедельник следующей недели:
 * в выходной обычно смотрят, что задано на завтра.
 */
export function resolveDiaryDate(
  param: string | null | undefined,
  today: IsoDate,
): IsoDate {
  const date = param && isValidIsoDate(param) ? param : today;
  return isSunday(date) ? addDays(date, 1) : date;
}

/** Соседний учебный день (воскресенье пропускаем). */
export function shiftSchoolDay(date: IsoDate, step: 1 | -1): IsoDate {
  const next = addDays(date, step);
  return isSunday(next) ? addDays(next, step) : next;
}

const dayMonth = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

function parts(date: IsoDate) {
  const [day = "", month = ""] = dayMonth
    .format(new Date(`${date}T00:00:00Z`))
    .split(" ");
  return { day, month };
}

/** Подпись недели Пн–Сб: «12–17 октября», «28 сентября – 3 октября». */
export function formatWeekRange(monday: IsoDate): string {
  const from = parts(monday);
  const to = parts(addDays(monday, 5));
  if (from.month === to.month) return `${from.day}–${to.day} ${to.month}`;
  return `${from.day} ${from.month} – ${to.day} ${to.month}`;
}

/** Неделя есть на старом сайте. Список ещё не загружен — не запрещаем. */
export function weekIsAvailable(
  weeks: readonly IsoDate[] | undefined,
  monday: IsoDate,
): boolean {
  return !weeks || weeks.length === 0 || weeks.includes(monday);
}

/** «сегодня», «завтра», «вчера» — подпись к большому числу дня; для остальных дней пусто. */
export function relativeDayLabel(date: IsoDate, today: IsoDate): string | null {
  if (date === today) return "сегодня";
  if (date === addDays(today, 1)) return "завтра";
  if (date === addDays(today, -1)) return "вчера";
  return null;
}

/** «октябрь» — месяц выбранного дня в именительном падеже. */
export function formatMonth(date: IsoDate): string {
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

/** «1 задание», «3 задания», «5 заданий»; ноль — «заданий нет». */
export function formatTaskCount(count: number): string {
  if (count === 0) return "заданий нет";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} задание`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} задания`;
  }
  return `${count} заданий`;
}

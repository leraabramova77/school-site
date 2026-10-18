import type { IsoDate } from "@/shared/lib/date";
import type { DiaryItem, DiaryWeek } from "@/shared/netschool";

/*
 * Дневник для экрана: задания недели по дням. Только то, что нужно показать, — без служебных полей старого сайта.
 */

/** Отметка как у сущности «оценка»: 1–5 или долг (точка на старом сайте). */
export type DiaryMark = 1 | 2 | 3 | 4 | 5 | "debt";

export type DiaryEntry = {
  id: string;
  subject: string;
  /** Код типа задания на старом сайте: `Д` — домашнее, `К`, `С`, `О`… */
  typeCode: string;
  isHomework: boolean;
  /** Тема или текст задания. */
  text: string;
  weight: number | null;
  mark: DiaryMark | null;
  /** Ссылка на подробности задания (`/api/assignment`); нет — подробностей нет. */
  assignment: { aid: string; cid: string; tp: string } | null;
};

export type DiaryDay = { date: IsoDate; entries: DiaryEntry[] };

export type DiaryWeekView = {
  /** Понедельник показанной недели. */
  monday: IsoDate | null;
  /** Понедельники недель, доступных на старом сайте. */
  weeks: IsoDate[];
  days: DiaryDay[];
};

export type AssignmentView = {
  title: string | null;
  /** Значения — уже очищенный HTML. */
  rows: { label: string; html: string }[];
};

function toMark(item: DiaryItem): DiaryMark | null {
  if (item.mark !== null) return item.mark;
  // Точка — задание не сдано (долг).
  return item.markRaw === "." ? "debt" : null;
}

export function toDiaryWeekView(week: DiaryWeek): DiaryWeekView {
  const days = new Map<IsoDate, DiaryEntry[]>();
  week.items.forEach((item, index) => {
    const entries = days.get(item.date) ?? [];
    entries.push({
      id: item.assignment
        ? `${item.assignment.aid}-${item.assignment.tp}`
        : `${item.date}-${index}`,
      subject: item.subject,
      typeCode: item.typeCode,
      isHomework: item.typeCode === "Д",
      text: item.theme,
      weight: item.weight,
      mark: toMark(item),
      assignment: item.assignment,
    });
    days.set(item.date, entries);
  });
  return {
    monday: week.selectedWeek,
    weeks: week.weeks,
    days: [...days]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, entries]) => ({ date, entries })),
  };
}

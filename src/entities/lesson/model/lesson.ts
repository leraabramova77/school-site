/**
 * Урок в дневнике. Оценки — отдельная сущность (`entities/grade`): виджет кладёт их в LessonCard слотом.
 * Время — «8:30», как в расписании старого сайта; кабинета там нет, поле на будущее.
 */
export type Lesson = {
  id: string;
  /** Номер урока в дне, с 1. */
  number: number;
  subject: string;
  start?: string;
  end?: string;
  room?: string;
  /** Домашнее задание простым текстом (HTML учителя — только через санитайзер, ТЗ-1 §4.6). */
  homework?: string;
};

/** «8:30–9:10», «с 8:30» или пусто. */
export function formatLessonTime(
  lesson: Pick<Lesson, "start" | "end">,
): string {
  if (lesson.start && lesson.end) return `${lesson.start}–${lesson.end}`;
  return lesson.start ?? "";
}

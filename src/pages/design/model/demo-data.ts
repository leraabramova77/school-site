import type { Grade } from "@/entities/grade";
import type { Lesson } from "@/entities/lesson";

/** Выдуманные данные для витрины — ни одного настоящего ученика или учителя. */
export const demoWeek = "2026-10-12";
export const demoToday = "2026-10-14";
/** Оценки по дням — цветные точки в ленте. */
export const demoDayDots: Record<string, string[]> = {
  "2026-10-12": ["var(--grade-5)", "var(--grade-4)"],
  "2026-10-14": ["var(--grade-3)"],
  "2026-10-16": ["var(--grade-5)", "var(--grade-debt)", "var(--grade-4)"],
};

export const demoLessons: {
  lesson: Lesson;
  grades: Grade[];
  current?: boolean;
}[] = [
  {
    lesson: {
      id: "l1",
      number: 1,
      subject: "Алгебра",
      start: "8:30",
      end: "9:10",
      room: "21",
    },
    grades: [
      { id: "g1", mark: 5, weight: 10, workType: "Самостоятельная работа" },
    ],
  },
  {
    lesson: {
      id: "l2",
      number: 2,
      subject: "Русский язык",
      start: "9:20",
      end: "10:00",
      homework: "Упражнение 112, выучить правило на с. 48.\nПринести словарь.",
    },
    grades: [
      { id: "g2", mark: 4, weight: 10, workType: "Диктант" },
      { id: "g3", mark: 3, weight: 10 },
    ],
    current: true,
  },
  {
    lesson: {
      id: "l3",
      number: 3,
      subject: "История Кыргызстана и всемирная история",
      start: "10:20",
      end: "11:00",
      homework: "Параграф 7, ответить на вопросы 1–4 письменно.",
    },
    grades: [{ id: "g4", mark: "debt", workType: "Домашняя работа" }],
  },
  {
    lesson: {
      id: "l4",
      number: 4,
      subject: "Физика",
      start: "11:10",
      end: "11:50",
    },
    grades: [
      { id: "g5", mark: 2, weight: 100, workType: "Контрольная работа" },
    ],
  },
];

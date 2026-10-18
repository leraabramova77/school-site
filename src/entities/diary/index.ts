// Дневник недели. Обработчики API — серверные: импортировать только из route и серверных компонентов.
export { assignmentHandler, diaryHandler } from "./api/diary.server";
export type {
  AssignmentView,
  DiaryDay,
  DiaryEntry,
  DiaryMark,
  DiaryWeekView,
} from "./model/diary";

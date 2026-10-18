// Дневник недели: типы, запросы TanStack Query. Обработчики API — в `./server` (только для route handlers).
export {
  diaryKeys,
  diaryWeekQuery,
  useAssignment,
  useDiaryWeek,
} from "./api/diary";
export type {
  AssignmentRef,
  AssignmentView,
  DiaryDay,
  DiaryEntry,
  DiaryMark,
  DiaryWeekView,
} from "./model/diary";
export { daysWithMarks, workTypeLabel } from "./model/diary";

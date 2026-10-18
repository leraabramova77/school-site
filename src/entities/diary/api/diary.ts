import { queryOptions, useQuery } from "@tanstack/react-query";
import { getApi } from "@/shared/api";
import type { IsoDate } from "@/shared/lib/date";
import type {
  AssignmentRef,
  AssignmentView,
  DiaryWeekView,
} from "../model/diary";

export const diaryKeys = {
  all: ["diary"] as const,
  week: (monday: IsoDate) => [...diaryKeys.all, "week", monday] as const,
  assignment: (ref: AssignmentRef) =>
    [...diaryKeys.all, "assignment", ref.aid, ref.cid, ref.tp] as const,
};

/** Неделя дневника; `monday` — понедельник недели. */
export function diaryWeekQuery(monday: IsoDate) {
  return queryOptions({
    queryKey: diaryKeys.week(monday),
    queryFn: ({ signal }) =>
      getApi<DiaryWeekView>(`/api/diary?week=${monday}`, signal),
  });
}

export function useDiaryWeek(monday: IsoDate) {
  return useQuery(diaryWeekQuery(monday));
}

/** Подробности задания грузятся, только когда их раскрыли (`enabled`). */
export function useAssignment(ref: AssignmentRef, enabled: boolean) {
  return useQuery({
    queryKey: diaryKeys.assignment(ref),
    queryFn: ({ signal }) =>
      getApi<AssignmentView>(
        `/api/assignment?${new URLSearchParams(ref)}`,
        signal,
      ),
    enabled,
    staleTime: 30 * 60_000,
  });
}

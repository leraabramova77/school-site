import { Suspense } from "react";
import { Screen } from "@/widgets/app-shell";
import { DiaryWeek } from "./DiaryWeek";
import { DiaryWeekSkeleton } from "./DiaryWeekSkeleton";

/** «Дневник»: задания и отметки по дням недели. Данные — только в браузере, через `/api/diary`. */
export function DiaryPage() {
  return (
    <Screen title="Дневник">
      <Suspense fallback={<DiaryWeekSkeleton />}>
        <DiaryWeek />
      </Suspense>
    </Screen>
  );
}

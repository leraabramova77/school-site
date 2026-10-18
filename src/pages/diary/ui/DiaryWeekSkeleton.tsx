import { Skeleton } from "@/shared/ui";

/** Карточки заданий на время загрузки. */
export function DiaryEntriesSkeleton() {
  return (
    <>
      <span className="sr-only">Загружаем дневник…</span>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_auto] gap-x-3.5 gap-y-2 rounded-card bg-surface py-4 pr-4 pl-5"
        >
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="row-span-3 size-[3.375rem] rounded-[1.0625rem]" />
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </>
  );
}

/** Весь экран недели до гидрации или до первой загрузки. */
export function DiaryWeekSkeleton() {
  return (
    <div aria-busy className="flex flex-col gap-4">
      <div className="flex items-end gap-3.5">
        <Skeleton className="h-[5.5rem] w-32 rounded-2xl" />
        <div className="flex flex-col gap-2 pb-1">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <Skeleton className="h-11 w-full" />
      <div className="grid grid-cols-6 gap-1.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-[4.5rem] rounded-[1.125rem]" />
        ))}
      </div>
      <DiaryEntriesSkeleton />
    </div>
  );
}

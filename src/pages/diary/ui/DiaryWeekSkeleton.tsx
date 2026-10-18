import { Skeleton } from "@/shared/ui";

/** Карточки заданий на время загрузки. */
export function DiaryEntriesSkeleton() {
  return (
    <>
      <span className="sr-only">Загружаем дневник…</span>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4"
        >
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="h-3.5 w-1/4" />
          <Skeleton className="mt-1 h-4 w-full" />
        </div>
      ))}
    </>
  );
}

/** Весь экран недели до гидрации или до первой загрузки. */
export function DiaryWeekSkeleton() {
  return (
    <div aria-busy className="flex flex-col gap-4">
      <div className="flex h-11 items-center justify-between">
        <Skeleton className="size-11" />
        <Skeleton className="h-5 w-36" />
        <Skeleton className="size-11" />
      </div>
      <Skeleton className="h-16 rounded-2xl" />
      <Skeleton className="h-4 w-40" />
      <DiaryEntriesSkeleton />
    </div>
  );
}

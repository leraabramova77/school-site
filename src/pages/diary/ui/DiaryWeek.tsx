"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CalendarCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { diaryWeekQuery, useDiaryWeek } from "@/entities/diary";
import { gradeColor } from "@/entities/grade";
import { useDesign } from "@/features/design-switch";
import { ApiError } from "@/shared/api";
import { cn } from "@/shared/lib/cn";
import { addDays, type IsoDate, startOfWeek } from "@/shared/lib/date";
import { useSwipe } from "@/shared/lib/swipe";
import { useToday } from "@/shared/lib/today";
import { EmptyState, ErrorState } from "@/shared/ui";
import {
  formatWeekRange,
  relativeDayLabel,
  resolveDiaryDate,
  shiftSchoolDay,
  weekIsAvailable,
} from "../model/diary-date";
import { DiaryViewA } from "./DiaryViewA";
import { DiaryViewB } from "./DiaryViewB";
import { DiaryViewC } from "./DiaryViewC";
import { DiaryEntriesSkeleton, DiaryWeekSkeleton } from "./DiaryWeekSkeleton";
import type { DiaryViewProps } from "./diary-view";

const views = { a: DiaryViewA, b: DiaryViewB, c: DiaryViewC };

/** Неделя дневника: переключатель недель, лента дней, задания выбранного дня. День — в адресе `?date=`. */
export function DiaryWeek() {
  const today = useToday();
  // «Сегодня» известно только в браузере — до гидрации показываем скелетон.
  if (!today) return <DiaryWeekSkeleton />;
  return <DiaryWeekContent today={today} />;
}

function DiaryWeekContent({ today }: { today: IsoDate }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [direction, setDirection] = useState<1 | -1>(1);
  const View = views[useDesign()];

  const home = resolveDiaryDate(null, today);
  const date = resolveDiaryDate(searchParams?.get("date"), today);
  const monday = startOfWeek(date);
  const prevWeek = addDays(monday, -7);
  const nextWeek = addDays(monday, 7);
  const week = useDiaryWeek(monday);
  const weeks = week.data?.weeks;

  function go(next: IsoDate) {
    if (next === date) return;
    setDirection(next > date ? 1 : -1);
    const params = new URLSearchParams(searchParams?.toString());
    if (next === home) params.delete("date");
    else params.set("date", next);
    const query = params.toString();
    // Без запроса к серверу: Next синхронизирует useSearchParams с history API.
    window.history.replaceState(
      null,
      "",
      query ? `${pathname}?${query}` : pathname,
    );
  }

  const swipe = useSwipe((side) => {
    const next = shiftSchoolDay(date, side === "left" ? 1 : -1);
    if (weekIsAvailable(weeks, startOfWeek(next))) go(next);
  });

  // У края недели заранее грузим соседнюю — листание через выходные без ожидания.
  const edgeWeek =
    date === addDays(monday, 5) ? nextWeek : date === monday ? prevWeek : null;
  useEffect(() => {
    if (weeks && edgeWeek && weekIsAvailable(weeks, edgeWeek)) {
      void queryClient.prefetchQuery(diaryWeekQuery(edgeWeek));
    }
  }, [weeks, edgeWeek, queryClient]);

  const days = week.data?.days ?? [];
  const day = days.find((d) => d.date === date);
  const needLogin = week.error instanceof ApiError && week.error.needLogin;

  const renderDay: DiaryViewProps["renderDay"] = ({
    entries,
    empty,
    className,
  }) => (
    <section
      aria-labelledby="diary-day-title"
      aria-busy={week.isPending}
      // overflow-x-clip: карточка дня въезжает сбоку и не должна расширять страницу.
      className="flex flex-1 touch-pan-y flex-col overflow-x-clip"
      {...swipe}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={date}
          initial={{ opacity: 0, x: 24 * direction }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 * direction }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          className={cn("flex flex-col gap-2.5", className)}
        >
          {week.isPending || needLogin ? (
            <DiaryEntriesSkeleton />
          ) : week.isError ? (
            <ErrorState
              description={week.error.message}
              onRetry={() => week.refetch()}
            />
          ) : day && day.entries.length > 0 ? (
            entries(day.entries)
          ) : (
            (empty ?? (
              <EmptyState
                className="rounded-card bg-surface"
                icon={<CalendarCheck aria-hidden />}
                title="Заданий нет"
                description="В этот день в дневнике пусто."
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );

  return (
    <View
      date={date}
      today={today}
      monday={monday}
      relative={relativeDayLabel(date, today)}
      taskCount={day ? day.entries.length : week.isSuccess ? 0 : null}
      weekLabel={formatWeekRange(monday)}
      canPrevWeek={weekIsAvailable(weeks, prevWeek)}
      canNextWeek={weekIsAvailable(weeks, nextWeek)}
      showToday={startOfWeek(home) !== monday}
      onPrevWeek={() => go(prevWeek)}
      onNextWeek={() => go(nextWeek)}
      onToday={() => go(home)}
      onSelect={go}
      dots={Object.fromEntries(
        days.map((d) => [
          d.date,
          d.entries.flatMap((e) =>
            e.mark === null ? [] : [gradeColor(e.mark)],
          ),
        ]),
      )}
      counts={Object.fromEntries(days.map((d) => [d.date, d.entries.length]))}
      renderDay={renderDay}
    />
  );
}

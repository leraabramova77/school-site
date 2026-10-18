"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { daysWithMarks, diaryWeekQuery, useDiaryWeek } from "@/entities/diary";
import { ApiError } from "@/shared/api";
import {
  addDays,
  formatDayLong,
  type IsoDate,
  startOfWeek,
} from "@/shared/lib/date";
import { useSwipe } from "@/shared/lib/swipe";
import { useToday } from "@/shared/lib/today";
import { Button, DayStrip, EmptyState, ErrorState } from "@/shared/ui";
import {
  formatWeekRange,
  resolveDiaryDate,
  shiftSchoolDay,
  weekIsAvailable,
} from "../model/diary-date";
import { DiaryEntryCard } from "./DiaryEntryCard";
import { DiaryEntriesSkeleton, DiaryWeekSkeleton } from "./DiaryWeekSkeleton";

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

  const day = week.data?.days.find((d) => d.date === date);
  const needLogin = week.error instanceof ApiError && week.error.needLogin;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Предыдущая неделя"
          disabled={!weekIsAvailable(weeks, prevWeek)}
          onClick={() => go(prevWeek)}
        >
          <ChevronLeft aria-hidden />
        </Button>
        <h2 className="flex-1 text-center font-semibold text-body">
          {formatWeekRange(monday)}
        </h2>
        {startOfWeek(home) !== monday && (
          <Button variant="secondary" size="sm" onClick={() => go(home)}>
            Сегодня
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Следующая неделя"
          disabled={!weekIsAvailable(weeks, nextWeek)}
          onClick={() => go(nextWeek)}
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>

      <DayStrip
        week={monday}
        selected={date}
        today={today}
        marked={week.data ? daysWithMarks(week.data) : []}
        onSelect={go}
        className="-mx-1"
      />

      <section
        aria-labelledby="diary-day-title"
        aria-busy={week.isPending}
        // overflow-x-clip: карточка дня въезжает сбоку и не должна расширять страницу.
        className="flex flex-1 touch-pan-y flex-col gap-3 overflow-x-clip"
        {...swipe}
      >
        <h3
          id="diary-day-title"
          className="font-semibold text-subhead text-text-muted first-letter:uppercase"
        >
          {formatDayLong(date)}
        </h3>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={date}
            initial={{ opacity: 0, x: 24 * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 * direction }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="flex flex-col gap-3"
          >
            {week.isPending || needLogin ? (
              <DiaryEntriesSkeleton />
            ) : week.isError ? (
              <ErrorState
                description={week.error.message}
                onRetry={() => week.refetch()}
              />
            ) : day && day.entries.length > 0 ? (
              day.entries.map((entry) => (
                <DiaryEntryCard key={entry.id} entry={entry} />
              ))
            ) : (
              <EmptyState
                icon={<CalendarCheck aria-hidden />}
                title="Заданий нет"
                description="На этот день в дневнике ничего не записано."
              />
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}

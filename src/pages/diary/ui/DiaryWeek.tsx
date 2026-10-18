"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { diaryWeekQuery, useDiaryWeek } from "@/entities/diary";
import { gradeColor } from "@/entities/grade";
import { ApiError } from "@/shared/api";
import {
  addDays,
  formatDayLong,
  formatDayOfMonth,
  type IsoDate,
  startOfWeek,
} from "@/shared/lib/date";
import { useSwipe } from "@/shared/lib/swipe";
import { useToday } from "@/shared/lib/today";
import { Button, DayStrip, EmptyState, ErrorState } from "@/shared/ui";
import {
  formatMonth,
  formatTaskCount,
  formatWeekRange,
  relativeDayLabel,
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
  const relative = relativeDayLabel(date, today);
  const dots = Object.fromEntries(
    (week.data?.days ?? []).map((d) => [
      d.date,
      d.entries.flatMap((e) => (e.mark === null ? [] : [gradeColor(e.mark)])),
    ]),
  );

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Большое число — выбранный день (не обязательно сегодня), поэтому рядом подпись «сегодня/завтра/вчера». */}
      <header className="grid grid-cols-[auto_1fr] items-end gap-3.5">
        <p
          aria-hidden
          className="-ml-1 font-display font-extrabold text-[6.5rem] leading-[0.82] tracking-[-0.06em]"
        >
          {formatDayOfMonth(date)}
        </p>
        <div className="min-w-0 pb-1">
          {relative && (
            <span className="mb-1.5 inline-block rounded-full bg-accent px-2.5 py-0.5 font-extrabold text-[0.6875rem] text-accent-fg uppercase tracking-wider">
              {relative}
            </span>
          )}
          <h2
            id="diary-day-title"
            className="font-bold font-display text-title-3 leading-tight"
          >
            {formatDayLong(date).split(",")[0]}
            <span className="sr-only">
              , {formatDayLong(date).split(", ")[1]}
            </span>
          </h2>
          <p className="mt-1 text-subhead text-text-muted">
            {formatMonth(date)}
            {day !== undefined || week.isSuccess
              ? ` · ${formatTaskCount(day?.entries.length ?? 0)}`
              : ""}
          </p>
        </div>
      </header>

      <div className="-mx-2.5 flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Предыдущая неделя"
          disabled={!weekIsAvailable(weeks, prevWeek)}
          onClick={() => go(prevWeek)}
        >
          <ChevronLeft aria-hidden />
        </Button>
        <p className="flex-1 font-bold text-subhead text-text-muted">
          {formatWeekRange(monday)}
        </p>
        {startOfWeek(home) !== monday && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-full border-0 font-bold"
            onClick={() => go(home)}
          >
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
        dots={dots}
        onSelect={go}
      />

      <section
        aria-labelledby="diary-day-title"
        aria-busy={week.isPending}
        // overflow-x-clip: карточка дня въезжает сбоку и не должна расширять страницу.
        className="mt-1 flex flex-1 touch-pan-y flex-col gap-2.5 overflow-x-clip"
        {...swipe}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={date}
            initial={{ opacity: 0, x: 24 * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 * direction }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="flex flex-col gap-2.5"
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
                className="rounded-card bg-surface"
                icon={<CalendarCheck aria-hidden />}
                title="Заданий нет"
                description="В этот день в дневнике пусто."
              />
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}

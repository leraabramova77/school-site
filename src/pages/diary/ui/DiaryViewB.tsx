"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { DesignSwitch } from "@/features/design-switch";
import { formatDayLong, formatDayOfMonth } from "@/shared/lib/date";
import { Button, DayStrip } from "@/shared/ui";
import { formatMonth, formatTaskCount } from "../model/diary-date";
import { DiaryEntryCard } from "./DiaryEntryCard";
import type { DiaryViewProps } from "./diary-view";

/** Вариант B «Цвет предмета»: большое число выбранного дня, карточки с полосой цвета предмета, оценки плитками. */
export function DiaryViewB(props: DiaryViewProps) {
  const { date, relative, taskCount } = props;
  const [weekday, dayMonth] = formatDayLong(date).split(", ");

  return (
    <div className="flex flex-1 flex-col gap-4">
      <DesignSwitch className="self-end" />

      {/* Большое число — выбранный день (не обязательно сегодня), поэтому рядом подпись «сегодня/завтра/вчера». */}
      <header className="-mt-2 grid grid-cols-[auto_1fr] items-end gap-3.5">
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
            {weekday}
            <span className="sr-only">, {dayMonth}</span>
          </h2>
          <p className="mt-1 text-subhead text-text-muted">
            {formatMonth(date)}
            {taskCount !== null && ` · ${formatTaskCount(taskCount)}`}
          </p>
        </div>
      </header>

      <div className="-mx-2.5 flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Предыдущая неделя"
          disabled={!props.canPrevWeek}
          onClick={props.onPrevWeek}
        >
          <ChevronLeft aria-hidden />
        </Button>
        <p className="flex-1 font-bold text-subhead text-text-muted">
          {props.weekLabel}
        </p>
        {props.showToday && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-full border-0 font-bold"
            onClick={props.onToday}
          >
            Сегодня
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Следующая неделя"
          disabled={!props.canNextWeek}
          onClick={props.onNextWeek}
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>

      <DayStrip
        week={props.monday}
        selected={date}
        today={props.today}
        dots={props.dots}
        onSelect={props.onSelect}
      />

      {props.renderDay({
        className: "mt-1",
        entries: (entries) =>
          entries.map((entry) => (
            <DiaryEntryCard key={entry.id} entry={entry} />
          )),
      })}
    </div>
  );
}

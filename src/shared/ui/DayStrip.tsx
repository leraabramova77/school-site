"use client";

import { motion } from "motion/react";
import { cn } from "@/shared/lib/cn";
import {
  formatDayLong,
  formatDayOfMonth,
  formatWeekdayShort,
  type IsoDate,
  schoolWeek,
} from "@/shared/lib/date";

type DayStripProps = {
  /** Любой день нужной недели — лента покажет её Пн–Сб. */
  week: IsoDate;
  selected: IsoDate;
  onSelect: (date: IsoDate) => void;
  /** Сегодня — подчёркнуто цветом, даже если выбран другой день. */
  today?: IsoDate;
  /** Дни с отметкой-точкой (например, есть новые оценки). */
  marked?: readonly IsoDate[];
  className?: string;
};

/** Лента дней недели Пн–Сб. Свайпы между днями и неделями — на экране «Дневник». */
export function DayStrip({
  week,
  selected,
  onSelect,
  today,
  marked = [],
  className,
}: DayStripProps) {
  return (
    <div
      data-slot="day-strip"
      className={cn("grid grid-cols-6 gap-1", className)}
    >
      {schoolWeek(week).map((date) => {
        const isSelected = date === selected;
        const isToday = date === today;
        return (
          <button
            key={date}
            type="button"
            onClick={() => onSelect(date)}
            aria-pressed={isSelected}
            aria-current={isToday ? "date" : undefined}
            aria-label={`${formatDayLong(date)}${isToday ? ", сегодня" : ""}`}
            className={cn(
              "relative flex h-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl transition-colors",
              !isSelected && "hover:bg-surface-2",
              isToday && !isSelected
                ? "text-accent"
                : isSelected
                  ? "text-accent-fg"
                  : "text-text",
            )}
          >
            {isSelected && (
              <motion.span
                layoutId={`day-strip-${week}`}
                aria-hidden
                className="absolute inset-0 rounded-2xl bg-accent"
                transition={{ type: "spring", duration: 0.25, bounce: 0.2 }}
              />
            )}
            <span
              className={cn(
                "relative text-footnote",
                !isSelected && !isToday && "text-text-muted",
              )}
            >
              {formatWeekdayShort(date)}
            </span>
            <span className="relative font-semibold text-title-3 leading-none">
              {formatDayOfMonth(date)}
            </span>
            <span
              aria-hidden
              className={cn(
                "relative size-1 rounded-full",
                marked.includes(date)
                  ? isSelected
                    ? "bg-accent-fg"
                    : "bg-accent"
                  : "bg-transparent",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

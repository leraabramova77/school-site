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
  /** Сегодня — число подчёркнуто, даже если выбран другой день. */
  today?: IsoDate;
  /** Цветные точки под числом (CSS-цвета, например `var(--grade-5)`) — оценки дня. Показываем до четырёх. */
  dots?: Partial<Record<IsoDate, readonly string[]>>;
  className?: string;
};

/** Лента дней недели Пн–Сб: плашки, выбранная — инверсией. Свайпы между днями — на экране «Дневник». */
export function DayStrip({
  week,
  selected,
  onSelect,
  today,
  dots = {},
  className,
}: DayStripProps) {
  return (
    <div
      data-slot="day-strip"
      className={cn("grid grid-cols-6 gap-1.5", className)}
    >
      {schoolWeek(week).map((date) => {
        const isSelected = date === selected;
        const isToday = date === today;
        const dayDots = (dots[date] ?? []).slice(0, 4);
        return (
          <button
            key={date}
            type="button"
            onClick={() => onSelect(date)}
            aria-pressed={isSelected}
            aria-current={isToday ? "date" : undefined}
            aria-label={`${formatDayLong(date)}${isToday ? ", сегодня" : ""}`}
            className={cn(
              "relative flex h-[4.5rem] cursor-pointer flex-col items-center justify-center gap-1 rounded-[1.125rem] bg-surface transition-colors",
              isSelected ? "text-accent-fg" : "text-text hover:bg-surface-2",
            )}
          >
            {isSelected && (
              <motion.span
                layoutId={`day-strip-${week}`}
                aria-hidden
                className="absolute inset-0 rounded-[1.125rem] bg-accent"
                transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
              />
            )}
            <span
              className={cn(
                "relative text-footnote leading-none",
                isSelected ? "opacity-70" : "text-text-muted",
              )}
            >
              {formatWeekdayShort(date)}
            </span>
            <span
              className={cn(
                "relative font-bold font-display text-[1.125rem] leading-none",
                isToday &&
                  !isSelected &&
                  "underline decoration-[3px] underline-offset-[5px]",
              )}
            >
              {formatDayOfMonth(date)}
            </span>
            <span aria-hidden className="relative flex h-1.5 gap-[3px]">
              {dayDots.map((color, i) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: точки дня не переставляются, порядок постоянный
                  key={i}
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </span>
          </button>
        );
      })}
    </div>
  );
}

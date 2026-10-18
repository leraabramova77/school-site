"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useId, useState } from "react";
import { type DiaryEntry, workTypeLabel } from "@/entities/diary";
import { DesignSwitch } from "@/features/design-switch";
import { cn } from "@/shared/lib/cn";
import {
  formatDayLong,
  formatDayOfMonth,
  formatWeekdayShort,
  schoolWeek,
} from "@/shared/lib/date";
import { Button } from "@/shared/ui";
import { formatTaskCount } from "../model/diary-date";
import { AssignmentDetails } from "./AssignmentDetails";
import type { DiaryViewProps } from "./diary-view";

/** Вариант A «Тетрадь»: лист бумажного дневника — красная линия полей, колонка «Оценка», отметки «красной ручкой». */
export function DiaryViewA(props: DiaryViewProps) {
  const { date, today, relative, taskCount } = props;
  const [weekday, dayMonth] = formatDayLong(date).split(", ");

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p aria-hidden className="font-bold text-[1.875rem] tracking-tight">
          Дневник
        </p>
        <DesignSwitch />
      </div>

      <div className="-mx-2.5 flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Предыдущая неделя"
          disabled={!props.canPrevWeek}
          onClick={props.onPrevWeek}
        >
          <ChevronLeft aria-hidden />
        </Button>
        <p className="flex-1 font-semibold text-subhead text-text-muted">
          {props.weekLabel}
        </p>
        {props.showToday && (
          <button
            type="button"
            onClick={props.onToday}
            className="h-9 cursor-pointer rounded-full bg-surface-2 px-3 font-medium text-accent text-subhead"
          >
            Сегодня
          </button>
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

      <div className="-mx-1 grid grid-cols-6">
        {schoolWeek(props.monday).map((d) => {
          const isSelected = d === date;
          const isToday = d === today;
          return (
            <button
              key={d}
              type="button"
              onClick={() => props.onSelect(d)}
              aria-pressed={isSelected}
              aria-current={isToday ? "date" : undefined}
              aria-label={`${formatDayLong(d)}${isToday ? ", сегодня" : ""}`}
              className={cn(
                "relative flex h-[4.125rem] cursor-pointer flex-col items-center justify-center rounded-[0.875rem] hover:bg-surface-2",
                isSelected && "text-accent",
              )}
            >
              {isToday && (
                <span
                  aria-hidden
                  className="absolute top-2 right-[calc(50%-1.25rem)] size-1.5 rounded-full bg-(--ink-red)"
                />
              )}
              <span
                className={cn(
                  "text-footnote lowercase",
                  !isSelected && "text-text-muted",
                )}
              >
                {formatWeekdayShort(d)}
              </span>
              <span className="font-semibold text-[1.3125rem] leading-tight">
                {formatDayOfMonth(d)}
              </span>
              {isSelected && (
                <svg
                  aria-hidden
                  viewBox="0 0 34 8"
                  fill="none"
                  className="absolute bottom-1.5 left-1/2 h-2 w-[2.125rem] -translate-x-1/2"
                >
                  <path
                    d="M2 5.5C9 3 20 2.2 32 3.6"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Лист дня: красная линия полей слева, колонка «Оценка» справа. */}
      <div className="overflow-hidden rounded-card bg-surface bg-[linear-gradient(to_right,transparent_21px,var(--ink-red)_21px,var(--ink-red)_22.5px,transparent_22.5px)] bg-no-repeat pb-2">
        <div className="flex flex-wrap items-baseline gap-x-2.5 px-4 pt-4 pb-2.5 pl-9">
          <h2
            id="diary-day-title"
            className="font-bold text-[1.375rem] tracking-tight first-letter:uppercase"
          >
            {weekday}
          </h2>
          <span className="text-subhead text-text-muted">
            {dayMonth}
            {relative && `, ${relative}`}
            {taskCount ? ` · ${formatTaskCount(taskCount)}` : ""}
          </span>
        </div>

        {props.renderDay({
          className: "gap-0",
          empty: (
            <div className="px-6 pt-10 pb-12 pl-9 text-center">
              <p className="font-bold font-hand text-[2.125rem] text-accent leading-tight">
                Заданий нет
              </p>
              <p className="mt-1.5 text-text-muted">
                В этот день в дневнике пусто.
              </p>
            </div>
          ),
          entries: (entries) => (
            <>
              <div
                aria-hidden
                className="grid grid-cols-[1fr_4.5rem] border-border border-b pl-9 text-[0.6875rem] text-text-muted uppercase tracking-[0.08em]"
              >
                <span className="pt-1 pb-1.5">Предмет и задание</span>
                <span className="border-border border-l pt-1 pb-1.5 text-center">
                  Оценка
                </span>
              </div>
              {entries.map((entry) => (
                <NotebookRow key={entry.id} entry={entry} />
              ))}
            </>
          ),
        })}
      </div>
    </div>
  );
}

function NotebookRow({ entry }: { entry: DiaryEntry }) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const workType = workTypeLabel(entry.typeCode);

  return (
    <article
      data-slot="diary-entry"
      className="grid grid-cols-[1fr_4.5rem] border-border border-b pl-9"
    >
      <div className="min-w-0 py-3.5 pr-3.5">
        <h3 className="font-semibold text-[1.0625rem] leading-snug">
          {entry.subject}
        </h3>
        <p
          className={cn(
            "text-footnote lowercase",
            entry.isHomework ? "font-medium text-accent" : "text-text-muted",
          )}
        >
          {workType}
        </p>
        {entry.text && (
          <p className="mt-1.5 whitespace-pre-line text-[0.96875rem] [overflow-wrap:anywhere]">
            {entry.text}
          </p>
        )}
        {entry.assignment && (
          <>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={detailsId}
              onClick={() => setOpen((value) => !value)}
              className="mt-2 min-h-8 cursor-pointer text-accent text-subhead underline decoration-1 decoration-dashed underline-offset-4"
            >
              {open ? "свернуть" : "подробнее"}
            </button>
            <div
              id={detailsId}
              hidden={!open}
              className="mt-1.5 rounded-xl bg-surface-2 px-3 py-2.5"
            >
              {open && <AssignmentDetails assignment={entry.assignment} />}
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col items-center border-border border-l pt-2">
        <NotebookMark entry={entry} workType={workType} />
      </div>
    </article>
  );
}

/** Отметка «красной ручкой»: цифра в кружке от руки, долг — подчёркнутое волной «долг». */
function NotebookMark({
  entry,
  workType,
}: {
  entry: DiaryEntry;
  workType: string;
}) {
  if (entry.mark === null) return null;
  if (entry.mark === "debt") {
    return (
      <span className="mt-3 font-bold font-hand text-(--ink-red) text-[1.5625rem] leading-none underline decoration-[1.5px] decoration-wavy underline-offset-[5px]">
        долг
      </span>
    );
  }
  return (
    <>
      <span
        role="img"
        aria-label={`Оценка ${entry.mark}, ${workType}${entry.weight ? `, вес ${entry.weight}` : ""}`}
        className="relative grid size-[3.25rem] place-items-center text-(--ink-red)"
      >
        <svg
          aria-hidden
          viewBox="0 0 52 52"
          fill="none"
          className="absolute inset-0 size-full"
        >
          <path
            d="M33 7.5C20 4 7.5 11 6.5 24.5S17 47 29 45.5 46.5 34 45 21.5 30 4.5 18.5 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <b className="translate-x-px translate-y-px font-bold font-hand text-[2.25rem] leading-none">
          {entry.mark}
        </b>
      </span>
      {entry.weight !== null && (
        <span aria-hidden className="-mt-0.5 text-[0.6875rem] text-text-muted">
          вес {entry.weight}
        </span>
      )}
    </>
  );
}

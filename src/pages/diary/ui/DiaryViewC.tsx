"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { type CSSProperties, useId, useState } from "react";
import { type DiaryEntry, workTypeLabel } from "@/entities/diary";
import { gradeColor } from "@/entities/grade";
import { DesignSwitch } from "@/features/design-switch";
import { cn } from "@/shared/lib/cn";
import {
  formatDayLong,
  formatDayOfMonth,
  formatWeekdayShort,
  schoolWeek,
} from "@/shared/lib/date";
import { AssignmentDetails } from "./AssignmentDetails";
import type { DiaryViewProps } from "./diary-view";

const iconButton =
  "grid size-11 cursor-pointer place-items-center rounded-full text-accent hover:bg-surface-2 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent";

/** Вариант C «Спокойный список»: системный стиль, задания сгруппированы — «Задано на дом» и «Работа на уроке». */
export function DiaryViewC(props: DiaryViewProps) {
  const { date, today, relative } = props;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            aria-hidden
            className="font-bold text-[2.125rem] leading-tight tracking-tight"
          >
            Дневник
          </p>
          <h2
            id="diary-day-title"
            className="mt-0.5 text-subhead text-text-muted first-letter:uppercase"
          >
            {formatDayLong(date)}
            {relative && ` · ${relative}`}
          </h2>
        </div>
        <DesignSwitch className="mt-1.5" />
      </div>

      <div className="-mx-2.5 mt-4 mb-1.5 flex items-center">
        <button
          type="button"
          aria-label="Предыдущая неделя"
          disabled={!props.canPrevWeek}
          onClick={props.onPrevWeek}
          className={iconButton}
        >
          <ChevronLeft aria-hidden className="size-[1.375rem]" />
        </button>
        <p className="flex-1 text-center font-semibold text-subhead">
          {props.weekLabel}
        </p>
        {props.showToday && (
          <button
            type="button"
            onClick={props.onToday}
            className="h-8 cursor-pointer rounded-full bg-surface-2 px-3 font-semibold text-accent text-subhead"
          >
            Сегодня
          </button>
        )}
        <button
          type="button"
          aria-label="Следующая неделя"
          disabled={!props.canNextWeek}
          onClick={props.onNextWeek}
          className={iconButton}
        >
          <ChevronRight aria-hidden className="size-[1.375rem]" />
        </button>
      </div>

      <div className="grid grid-cols-6 gap-0.5 rounded-2xl bg-surface p-1">
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
                "relative flex h-[3.625rem] cursor-pointer flex-col items-center justify-center rounded-xl",
                isSelected && "bg-accent text-accent-fg",
              )}
            >
              <span
                className={cn(
                  "text-footnote",
                  !isSelected && "text-text-muted",
                )}
              >
                {formatWeekdayShort(d)}
              </span>
              <span
                className={cn(
                  "font-semibold text-[1.125rem] leading-tight",
                  isToday && !isSelected && "text-accent",
                )}
              >
                {formatDayOfMonth(d)}
              </span>
              {(props.counts[d] ?? 0) > 0 && (
                <span
                  aria-hidden
                  className="absolute bottom-1.5 size-1 rounded-full bg-current opacity-50"
                />
              )}
            </button>
          );
        })}
      </div>

      {props.renderDay({
        className: "gap-0",
        empty: (
          <div className="mt-6 rounded-2xl bg-surface px-5 py-10 text-center">
            <p className="font-semibold text-[1.1875rem]">Заданий нет</p>
            <p className="mt-1 text-subhead text-text-muted">
              В этот день в дневнике пусто.
            </p>
          </div>
        ),
        entries: (entries) => (
          <>
            <ListSection
              title="Задано на дом"
              entries={entries.filter((e) => e.isHomework)}
            />
            <ListSection
              title="Работа на уроке"
              entries={entries.filter((e) => !e.isHomework)}
            />
          </>
        ),
      })}
    </div>
  );
}

function ListSection({
  title,
  entries,
}: {
  title: string;
  entries: DiaryEntry[];
}) {
  if (entries.length === 0) return null;
  return (
    <div className="mt-6">
      <h3 className="px-4 pb-1.5 font-medium text-footnote text-text-muted uppercase tracking-[0.04em]">
        {title}
      </h3>
      <ul className="overflow-hidden rounded-2xl bg-surface">
        {entries.map((entry) => (
          <ListItem key={entry.id} entry={entry} />
        ))}
      </ul>
    </div>
  );
}

function ListItem({ entry }: { entry: DiaryEntry }) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const workType = workTypeLabel(entry.typeCode);

  return (
    <li
      data-slot="diary-entry"
      className="relative grid grid-cols-[1fr_auto] gap-x-3.5 gap-y-0.5 px-4 py-3.5 not-first:before:absolute not-first:before:top-0 not-first:before:right-0 not-first:before:left-4 not-first:before:border-border not-first:before:border-t"
    >
      <h4 className="font-semibold text-[1.0625rem] leading-snug">
        {entry.subject}
      </h4>
      {entry.mark !== null && <ListGrade entry={entry} workType={workType} />}
      <p className="col-start-1 text-subhead text-text-muted [overflow-wrap:anywhere]">
        {entry.isHomework ? (
          entry.text
        ) : (
          <>
            <b className="font-medium text-text">{workType}</b>
            {entry.text && ` · ${entry.text}`}
          </>
        )}
      </p>
      {entry.assignment && (
        <>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={detailsId}
            onClick={() => setOpen((value) => !value)}
            className="col-span-full -mx-2 mt-1.5 -mb-1.5 inline-flex min-h-9 cursor-pointer items-center gap-1 justify-self-start rounded-lg px-2 font-medium text-accent text-subhead"
          >
            {open ? "Свернуть" : "Подробнее"}
            <ChevronDown
              aria-hidden
              className={cn(
                "size-[1.125rem] transition-transform",
                open && "rotate-180",
              )}
            />
          </button>
          <div
            id={detailsId}
            hidden={!open}
            className="col-span-full mt-2 rounded-xl bg-bg px-3.5 py-3"
          >
            {open && <AssignmentDetails assignment={entry.assignment} />}
          </div>
        </>
      )}
    </li>
  );
}

function ListGrade({
  entry,
  workType,
}: {
  entry: DiaryEntry;
  workType: string;
}) {
  if (entry.mark === null) return null;
  const debt = entry.mark === "debt";
  return (
    <div className="col-start-2 row-span-2 row-start-1 flex flex-col items-center self-center">
      <span
        role="img"
        aria-label={
          debt
            ? `Долг, ${workType}`
            : `Оценка ${entry.mark}, ${workType}${entry.weight ? `, вес ${entry.weight}` : ""}`
        }
        style={{ "--gc": gradeColor(entry.mark) } as CSSProperties}
        className={cn(
          "grid h-[2.375rem] min-w-[2.375rem] place-items-center rounded-[0.6875rem] bg-[color-mix(in_oklab,var(--gc)_13%,transparent)] px-2 font-bold text-(--gc)",
          debt ? "text-footnote" : "text-[1.25rem]",
        )}
      >
        {debt ? "долг" : entry.mark}
      </span>
      {entry.weight !== null && !debt && (
        <small aria-hidden className="mt-0.5 text-[0.6875rem] text-text-muted">
          вес {entry.weight}
        </small>
      )}
    </div>
  );
}

"use client";

import { ChevronDown } from "lucide-react";
import { type CSSProperties, useId, useState } from "react";
import { type DiaryEntry, subjectTone, workTypeLabel } from "@/entities/diary";
import { GradeChip } from "@/entities/grade";
import { cn } from "@/shared/lib/cn";
import { Card } from "@/shared/ui";
import { AssignmentDetails } from "./AssignmentDetails";

/**
 * Задание из дневника: полоса цвета предмета слева, предмет, тип, текст, оценка плиткой.
 * Подробности учителя раскрываются по нажатию.
 */
export function DiaryEntryCard({ entry }: { entry: DiaryEntry }) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const workType = workTypeLabel(entry.typeCode);
  const tone = {
    "--c": `var(--subject-${subjectTone(entry.subject)})`,
  } as CSSProperties;

  return (
    <Card
      data-slot="diary-entry"
      style={tone}
      className="grid grid-cols-[1fr_auto] gap-x-3.5 gap-y-1 py-4 pr-4 pl-5 shadow-[inset_6px_0_0_var(--c)]"
    >
      <h3 className="font-extrabold text-[1.0625rem] leading-snug">
        {entry.subject}
      </h3>

      {entry.mark !== null && (
        <div className="row-span-3 flex flex-col items-center gap-1">
          <GradeChip
            mark={entry.mark}
            weight={entry.weight ?? undefined}
            workType={workType}
            size="lg"
          />
          {entry.weight !== null && (
            <span
              aria-hidden
              className="font-bold text-[0.6875rem] text-text-muted"
            >
              вес {entry.weight}
            </span>
          )}
        </div>
      )}

      <p className="col-start-1 flex flex-wrap items-center gap-1.5 text-footnote text-text-muted">
        {entry.isHomework && (
          <span className="rounded-md bg-[color-mix(in_oklab,var(--c)_14%,transparent)] px-1.5 py-px font-extrabold text-(--c) text-[0.6875rem] tracking-wide">
            ДЗ
          </span>
        )}
        {workType}
      </p>

      {entry.text && (
        <p className="col-start-1 mt-1 whitespace-pre-line text-[0.96875rem] [overflow-wrap:anywhere]">
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
            className="col-span-full -mr-1.5 -mb-1.5 -ml-2.5 mt-2 flex min-h-11 cursor-pointer items-center justify-between rounded-[0.875rem] bg-[color-mix(in_oklab,var(--c)_10%,transparent)] px-3 font-bold text-(--c) text-subhead transition-colors hover:bg-[color-mix(in_oklab,var(--c)_16%,transparent)]"
          >
            {open ? "Свернуть" : "Подробнее"}
            <ChevronDown
              aria-hidden
              className={cn(
                "size-5 shrink-0 transition-transform duration-200 ease-spring",
                open && "rotate-180",
              )}
            />
          </button>
          <div id={detailsId} hidden={!open} className="col-span-full mt-3">
            {open && <AssignmentDetails assignment={entry.assignment} />}
          </div>
        </>
      )}
    </Card>
  );
}

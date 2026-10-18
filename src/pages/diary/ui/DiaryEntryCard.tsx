"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { type DiaryEntry, workTypeLabel } from "@/entities/diary";
import { GradeChip } from "@/entities/grade";
import { cn } from "@/shared/lib/cn";
import { Card } from "@/shared/ui";
import { AssignmentDetails } from "./AssignmentDetails";

/** Задание из дневника: предмет, тип, текст, отметка; подробности учителя раскрываются по нажатию. */
export function DiaryEntryCard({ entry }: { entry: DiaryEntry }) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const workType = workTypeLabel(entry.typeCode);

  return (
    <Card data-slot="diary-entry" className="overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-body">{entry.subject}</p>
          <p
            className={cn(
              "text-footnote",
              entry.isHomework ? "font-medium text-accent" : "text-text-muted",
            )}
          >
            {workType}
          </p>
          {entry.text && (
            <p className="mt-2 whitespace-pre-line break-words text-subhead">
              {entry.text}
            </p>
          )}
        </div>
        {entry.mark !== null && (
          <GradeChip
            mark={entry.mark}
            weight={entry.weight ?? undefined}
            workType={workType}
            showWeight={entry.weight !== null}
          />
        )}
      </div>

      {entry.assignment && (
        <>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={detailsId}
            onClick={() => setOpen((value) => !value)}
            className="flex min-h-11 w-full cursor-pointer items-center gap-2 border-border border-t px-4 text-left text-subhead text-text-muted transition-colors hover:bg-surface-2"
          >
            <span className="flex-1">
              {open ? "Скрыть подробности" : "Подробности"}
            </span>
            <ChevronDown
              aria-hidden
              className={cn(
                "size-5 shrink-0 transition-transform duration-200 ease-spring",
                open && "rotate-180",
              )}
            />
          </button>
          <div id={detailsId} hidden={!open} className="px-4 pb-4">
            {open && <AssignmentDetails assignment={entry.assignment} />}
          </div>
        </>
      )}
    </Card>
  );
}

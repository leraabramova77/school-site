import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Card } from "@/shared/ui";
import { formatLessonTime, type Lesson } from "../model/lesson";

type LessonCardProps = {
  lesson: Lesson;
  /** Оценки за урок — обычно GradeChip из `entities/grade`. */
  grades?: ReactNode;
  /** Урок идёт сейчас — подсветка рамкой. */
  current?: boolean;
  className?: string;
};

/**
 * Карточка урока: номер, время, предмет, кабинет, оценки; домашка раскрывается.
 * Раскрытие — нативный <details>: работает без JS и с клавиатуры, анимация — CSS (::details-content).
 */
export function LessonCard({
  lesson,
  grades,
  current = false,
  className,
}: LessonCardProps) {
  const time = formatLessonTime(lesson);
  return (
    <Card
      data-slot="lesson-card"
      aria-current={current ? "time" : undefined}
      className={cn(
        "overflow-hidden",
        current && "border-accent ring-1 ring-accent",
        className,
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex w-12 shrink-0 flex-col items-center pt-0.5">
          <span className="font-semibold text-text-muted text-title-3">
            {lesson.number}
          </span>
          {time && (
            <span className="text-center text-footnote text-text-muted">
              {time}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {current && (
            <p className="mb-0.5 font-semibold text-accent text-footnote uppercase tracking-wide">
              Идёт сейчас
            </p>
          )}
          <p className="font-semibold text-body">{lesson.subject}</p>
          {lesson.room && (
            <p className="text-footnote text-text-muted">каб. {lesson.room}</p>
          )}
        </div>
        {grades && (
          <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
            {grades}
          </div>
        )}
      </div>
      {lesson.homework && (
        <details className="group border-border border-t">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 text-subhead text-text-muted [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 flex-1 truncate group-open:hidden">
              <span className="font-medium text-text">ДЗ:</span>{" "}
              {lesson.homework}
            </span>
            <span className="hidden flex-1 font-medium text-text group-open:inline">
              Домашнее задание
            </span>
            <ChevronDown
              aria-hidden
              className="size-5 shrink-0 transition-transform duration-200 ease-spring group-open:rotate-180"
            />
          </summary>
          <p className="whitespace-pre-line px-4 pb-4 text-body">
            {lesson.homework}
          </p>
        </details>
      )}
    </Card>
  );
}

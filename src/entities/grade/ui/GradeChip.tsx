import { cn } from "@/shared/lib/cn";
import {
  type Grade,
  type GradeTone,
  gradeAriaLabel,
  gradeLabel,
  gradeTone,
} from "../model/grade";

// Полные имена классов — Tailwind находит их только целиком, собирать строкой `bg-grade-${tone}` нельзя.
const toneClass: Record<GradeTone, string> = {
  "5": "bg-grade-5-soft text-grade-5",
  "4": "bg-grade-4-soft text-grade-4",
  "3": "bg-grade-3-soft text-grade-3",
  "2": "bg-grade-2-soft text-grade-2",
  debt: "bg-grade-debt-soft text-grade-debt",
};

type GradeChipProps = Pick<Grade, "mark" | "weight" | "workType"> & {
  size?: "sm" | "md";
  /** Показать вес мелкой цифрой рядом с отметкой. */
  showWeight?: boolean;
  className?: string;
};

export function GradeChip({
  mark,
  weight,
  workType,
  size = "md",
  showWeight = false,
  className,
}: GradeChipProps) {
  const label = gradeLabel(mark);
  return (
    <span
      data-slot="grade-chip"
      role="img"
      aria-label={gradeAriaLabel({ mark, weight, workType })}
      title={workType}
      className={cn(
        // Снаружи — центр по обеим осям; внутри цифра и вес стоят на общей базовой линии.
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold leading-none",
        size === "md"
          ? "h-8 min-w-8 px-2.5 text-body"
          : "h-6 min-w-6 px-2 text-footnote",
        mark === "debt" && (size === "md" ? "text-subhead" : "text-[0.75rem]"),
        toneClass[gradeTone(mark)],
        className,
      )}
    >
      <span className="inline-flex items-baseline gap-0.5 leading-none">
        {label}
        {showWeight && weight !== undefined && (
          <span className="font-medium text-[0.625rem] leading-none opacity-80">
            {weight}
          </span>
        )}
      </span>
    </span>
  );
}

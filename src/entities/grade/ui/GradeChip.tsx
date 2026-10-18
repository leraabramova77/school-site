import { cn } from "@/shared/lib/cn";
import {
  type Grade,
  type GradeTone,
  gradeAriaLabel,
  gradeLabel,
  gradeTone,
} from "../model/grade";

// Полные имена классов — Tailwind находит их только целиком, собирать строкой `bg-grade-${tone}` нельзя.
// Плитка сплошного цвета, цифра — `--grade-fg` (белая в светлой теме, тёмная в тёмной); контраст проверяет tokens.test.
const toneClass: Record<GradeTone, string> = {
  "5": "bg-grade-5",
  "4": "bg-grade-4",
  "3": "bg-grade-3",
  "2": "bg-grade-2",
  debt: "bg-grade-debt",
};

const sizeClass = {
  sm: "h-6 min-w-6 rounded-lg px-1.5 text-footnote",
  md: "h-8 min-w-8 rounded-[0.625rem] px-2 text-body",
  lg: "size-[3.375rem] rounded-[1.0625rem] font-display text-[1.625rem]",
} as const;

const debtClass = {
  sm: "text-[0.6875rem]",
  md: "text-footnote",
  lg: "text-[0.6875rem] uppercase tracking-wide",
} as const;

type GradeChipProps = Pick<Grade, "mark" | "weight" | "workType"> & {
  /** `lg` — плитка на карточке задания в «Дневнике». */
  size?: keyof typeof sizeClass;
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
        "inline-flex shrink-0 items-center justify-center font-bold text-grade-fg leading-none",
        sizeClass[size],
        mark === "debt" && debtClass[size],
        toneClass[gradeTone(mark)],
        className,
      )}
    >
      <span className="inline-flex items-baseline gap-0.5 leading-none">
        {mark === "debt" ? label.toLowerCase() : label}
        {showWeight && weight !== undefined && (
          <span className="font-medium font-sans text-[0.625rem] leading-none opacity-80">
            {weight}
          </span>
        )}
      </span>
    </span>
  );
}

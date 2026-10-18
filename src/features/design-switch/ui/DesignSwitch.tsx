"use client";

import { cn } from "@/shared/lib/cn";
import {
  DESIGN_VARIANTS,
  designLabels,
  setDesign,
  useDesign,
} from "../model/design";

/** Переключатель вариантов оформления A / B / C. */
export function DesignSwitch({ className }: { className?: string }) {
  const design = useDesign();
  return (
    <fieldset
      className={cn(
        "flex shrink-0 gap-0.5 rounded-full bg-surface p-0.5 ring-1 ring-border",
        className,
      )}
    >
      <legend className="sr-only">Вариант оформления</legend>
      {DESIGN_VARIANTS.map((variant) => (
        <button
          key={variant}
          type="button"
          aria-pressed={variant === design}
          aria-label={`Вариант ${variant.toUpperCase()}: ${designLabels[variant]}`}
          title={designLabels[variant]}
          onClick={() => setDesign(variant)}
          className={cn(
            "size-8 cursor-pointer rounded-full font-bold text-footnote uppercase transition-colors",
            variant === design
              ? "bg-accent text-accent-fg"
              : "text-text-muted hover:text-text",
          )}
        >
          {variant}
        </button>
      ))}
    </fieldset>
  );
}

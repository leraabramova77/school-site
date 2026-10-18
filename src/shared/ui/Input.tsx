import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

/** Высота 44 px; ошибка — через `aria-invalid`, текст ошибки связывай с полем через `aria-describedby`. */
export function Input({
  className,
  type = "text",
  ...props
}: ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-border bg-surface px-3 text-body text-text transition-colors placeholder:text-text-muted focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-grade-2",
        className,
      )}
      {...props}
    />
  );
}

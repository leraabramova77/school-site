import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

/** Заглушка на время загрузки. Скрыта от скринридеров — загрузку объявляй у контейнера (`aria-busy`). */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("animate-pulse rounded-xl bg-surface-2", className)}
      {...props}
    />
  );
}

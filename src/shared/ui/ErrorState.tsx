"use client";

import { RotateCw, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "./Button";

type ErrorStateProps = {
  title?: string;
  /** Понятное объяснение без технических подробностей — коды и тексты ошибок сервера сюда не выводим. */
  description?: ReactNode;
  /** Если задан — показывается кнопка «Повторить». */
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = "Не удалось загрузить",
  description = "Проверь интернет и попробуй ещё раз.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      data-slot="error-state"
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-grade-2-soft text-grade-2 [&_svg]:size-7">
        <TriangleAlert aria-hidden />
      </div>
      <p className="font-semibold text-body">{title}</p>
      {description && (
        <p className="max-w-xs text-subhead text-text-muted">{description}</p>
      )}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-1">
          <RotateCw aria-hidden />
          Повторить
        </Button>
      )}
    </div>
  );
}

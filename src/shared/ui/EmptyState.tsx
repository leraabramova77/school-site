import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type EmptyStateProps = {
  title: string;
  description?: ReactNode;
  /** Иконка lucide-react; по умолчанию — пустой ящик. */
  icon?: ReactNode;
  /** Кнопка или ссылка под текстом. */
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center gap-3 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-surface-2 text-text-muted [&_svg]:size-7">
        {icon ?? <Inbox aria-hidden />}
      </div>
      <p className="font-semibold text-body">{title}</p>
      {description && (
        <p className="max-w-xs text-subhead text-text-muted">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

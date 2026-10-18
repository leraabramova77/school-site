"use client";

import { type AssignmentRef, useAssignment } from "@/entities/diary";
import { Button, SafeHtml, Skeleton } from "@/shared/ui";

/** Подробности задания от учителя. Грузятся при первом раскрытии карточки. */
export function AssignmentDetails({
  assignment,
}: {
  assignment: AssignmentRef;
}) {
  const query = useAssignment(assignment, true);

  if (query.isPending) {
    return (
      <div aria-busy className="flex flex-col gap-2 py-1">
        <span className="sr-only">Загружаем подробности…</span>
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex flex-col items-start gap-2">
        <p className="text-subhead text-text-muted">{query.error.message}</p>
        <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
          Повторить
        </Button>
      </div>
    );
  }

  const rows = query.data.rows.filter((row) => row.html.trim() !== "");
  if (rows.length === 0) {
    return (
      <p className="text-subhead text-text-muted">
        Учитель не добавил подробностей.
      </p>
    );
  }

  return (
    <dl className="flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col gap-0.5">
          <dt className="text-footnote text-text-muted">{row.label}</dt>
          <dd className="text-subhead">
            <SafeHtml sanitizedHtml={row.html} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

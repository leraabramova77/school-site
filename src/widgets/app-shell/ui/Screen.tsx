import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { AppShell } from "./AppShell";

type ScreenProps = {
  title: string;
  children: ReactNode;
  /** Заголовок только для скринридеров: экран рисует свою «шапку» (например, большое число дня в «Дневнике»). */
  hideTitle?: boolean;
  /** Подменить текущий адрес (витрина /design). */
  current?: string;
};

/** Экран раздела: каркас приложения, крупный заголовок, колонка контента с отступом под вырез iPhone. */
export function Screen({
  title,
  children,
  hideTitle = false,
  current,
}: ScreenProps) {
  return (
    <AppShell current={current}>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-6 lg:pt-10">
        <h1
          className={cn(
            "font-bold font-display text-large-title tracking-tight",
            hideTitle && "sr-only",
          )}
        >
          {title}
        </h1>
        {children}
      </main>
    </AppShell>
  );
}

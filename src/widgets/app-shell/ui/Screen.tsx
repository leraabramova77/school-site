import type { ReactNode } from "react";
import { AppShell } from "./AppShell";

type ScreenProps = {
  title: string;
  children: ReactNode;
  /** Подменить текущий адрес (витрина /design). */
  current?: string;
};

/** Экран раздела: каркас приложения, крупный заголовок, колонка контента с отступом под вырез iPhone. */
export function Screen({ title, children, current }: ScreenProps) {
  return (
    <AppShell current={current}>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-6 lg:pt-10">
        <h1 className="font-semibold text-large-title tracking-tight">
          {title}
        </h1>
        {children}
      </main>
    </AppShell>
  );
}

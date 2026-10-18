import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TabBar } from "./TabBar";

type AppShellProps = {
  children: ReactNode;
  /** Подменить текущий адрес (витрина /design). */
  current?: string;
};

/** Каркас приложения: таб-бар на мобилке, боковая панель на десктопе. Контент страницы — справа/сверху. */
export function AppShell({ children, current }: AppShellProps) {
  return (
    <div className="flex min-h-full flex-1">
      <Sidebar current={current} className="hidden lg:flex" />
      {/* Снизу место под плавающий таб-бар (≈ 4rem + зазор) и полоску iPhone. */}
      <div className="flex min-w-0 flex-1 flex-col pb-[calc(5.75rem+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </div>
      <TabBar current={current} className="lg:hidden" />
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { isNavItemActive, navItems } from "../config/nav";

type TabBarProps = {
  /** Подменить текущий адрес (витрина /design); обычно берётся из роутера. */
  current?: string;
  className?: string;
};

/** Нижний таб-бар на мобилке: полупрозрачная подложка с блюром, отступ под полоску iPhone. */
export function TabBar({ current, className }: TabBarProps) {
  const pathname = usePathname();
  const active = current ?? pathname ?? "";
  return (
    <nav
      aria-label="Разделы"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-border border-t bg-surface/80 pb-safe backdrop-blur-lg backdrop-saturate-150",
        className,
      )}
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 pl-safe pr-safe">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = isNavItemActive(href, active);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-0.5 font-medium text-[0.6875rem] transition-colors active:scale-95",
                  isActive ? "text-accent" : "text-text-muted hover:text-text",
                )}
              >
                <Icon
                  aria-hidden
                  className="size-6"
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

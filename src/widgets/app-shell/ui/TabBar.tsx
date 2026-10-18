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

/** Нижний таб-бар на мобилке: плавающая «пилюля» с блюром над полоской iPhone, активная вкладка — инверсией. */
export function TabBar({ current, className }: TabBarProps) {
  const pathname = usePathname();
  const active = current ?? pathname ?? "";
  return (
    <nav
      aria-label="Разделы"
      className={cn(
        "fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 px-4",
        className,
      )}
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 rounded-[1.625rem] bg-surface/85 p-1.5 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.3)] ring-1 ring-border backdrop-blur-xl backdrop-saturate-150">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = isNavItemActive(href, active);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-[1.25rem] font-bold text-[0.6875rem] transition-colors active:scale-95",
                  isActive
                    ? "bg-accent text-accent-fg"
                    : "text-text-muted hover:text-text",
                )}
              >
                <Icon
                  aria-hidden
                  className="size-[1.375rem]"
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

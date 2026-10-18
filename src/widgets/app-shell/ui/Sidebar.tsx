"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { isNavItemActive, navItems } from "../config/nav";

type SidebarProps = {
  /** Подменить текущий адрес (витрина /design); обычно берётся из роутера. */
  current?: string;
  className?: string;
};

/** Боковая панель на десктопе (≥ 1024 px). */
export function Sidebar({ current, className }: SidebarProps) {
  const pathname = usePathname();
  const active = current ?? pathname ?? "";
  return (
    <aside
      className={cn(
        "sticky top-0 h-dvh w-64 shrink-0 flex-col gap-6 py-6 pr-3 pl-[max(0.75rem,env(safe-area-inset-left))]",
        className,
      )}
    >
      <p className="px-3 font-bold font-display text-title-3 tracking-tight">
        Дневник
      </p>
      <nav aria-label="Разделы">
        <ul className="flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = isNavItemActive(href, active);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-2xl px-3 font-semibold text-body transition-colors",
                    isActive
                      ? "bg-accent text-accent-fg"
                      : "text-text-muted hover:bg-surface hover:text-text",
                  )}
                >
                  <Icon
                    aria-hidden
                    className="size-5"
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

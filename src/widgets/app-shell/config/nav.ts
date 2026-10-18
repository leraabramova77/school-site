import {
  BookOpen,
  ChartColumn,
  Ellipsis,
  House,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

/** Четыре раздела (ТЗ-1 §5.3). Объявления, профиль, тема и выход — внутри «Ещё». */
export const navItems: readonly NavItem[] = [
  { href: "/today", label: "Сегодня", icon: House },
  { href: "/diary", label: "Дневник", icon: BookOpen },
  { href: "/grades", label: "Оценки", icon: ChartColumn },
  { href: "/more", label: "Ещё", icon: Ellipsis },
];

/** Пункт активен на своей странице и на вложенных: «Оценки» подсвечены и на /grades/algebra. */
export function isNavItemActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

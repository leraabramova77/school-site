import type { ReactNode } from "react";
import type { DiaryEntry } from "@/entities/diary";
import type { IsoDate } from "@/shared/lib/date";

/** Всё, что нужно оформлению «Дневника» (варианты A / B / C). Логика недели, свайпы и загрузка — в DiaryWeek. */
export type DiaryViewProps = {
  date: IsoDate;
  today: IsoDate;
  monday: IsoDate;
  /** «сегодня» / «завтра» / «вчера» для выбранного дня, иначе null. */
  relative: string | null;
  /** Заданий в выбранном дне; null — неделя ещё грузится. */
  taskCount: number | null;
  weekLabel: string;
  canPrevWeek: boolean;
  canNextWeek: boolean;
  /** Показать кнопку «Сегодня»: открыта не текущая неделя. */
  showToday: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onSelect: (date: IsoDate) => void;
  /** Цвета оценок по дням — точки в ленте. */
  dots: Partial<Record<IsoDate, string[]>>;
  /** Число заданий по дням. */
  counts: Partial<Record<IsoDate, number>>;
  /**
   * Область дня: свайпы, анимация смены дня, скелетон, ошибка, «заданий нет».
   * Вариант передаёт, как нарисовать задания, и при желании своё «пусто».
   */
  renderDay: (options: {
    entries: (entries: DiaryEntry[]) => ReactNode;
    empty?: ReactNode;
    className?: string;
  }) => ReactNode;
};

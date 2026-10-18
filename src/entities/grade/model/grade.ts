/** Отметка: цифра 1–5 или долг (задание не сдано). */
export type GradeMark = 1 | 2 | 3 | 4 | 5 | "debt";

export type Grade = {
  id: string;
  mark: GradeMark;
  /** Вес отметки (на старом сайте 10, 100…); влияет на средний балл. */
  weight?: number;
  /** Тип работы словами: «Контрольная работа», «Домашняя работа». */
  workType?: string;
};

/** Цветовая группа отметки — суффикс токена `--grade-*`. Единица красится как двойка. */
export type GradeTone = "5" | "4" | "3" | "2" | "debt";

export function gradeTone(mark: GradeMark): GradeTone {
  if (mark === "debt") return "debt";
  if (mark <= 2) return "2";
  return String(mark) as GradeTone;
}

/** Что написано на чипе: цвет никогда не единственный носитель смысла (ТЗ-1 §5.1). */
export function gradeLabel(mark: GradeMark): string {
  return mark === "debt" ? "Долг" : String(mark);
}

/** Подпись для скринридера: «Оценка 5, вес 10, контрольная работа». */
export function gradeAriaLabel(
  grade: Pick<Grade, "mark" | "weight" | "workType">,
): string {
  const parts = [grade.mark === "debt" ? "Долг" : `Оценка ${grade.mark}`];
  if (grade.weight !== undefined) parts.push(`вес ${grade.weight}`);
  if (grade.workType) parts.push(grade.workType.toLowerCase());
  return parts.join(", ");
}

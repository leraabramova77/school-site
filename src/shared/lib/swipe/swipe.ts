export type SwipeDirection = "left" | "right";

/** Порог: палец прошёл по горизонтали больше 56px и заметно больше, чем по вертикали (это не прокрутка). */
export function swipeDirection(dx: number, dy: number): SwipeDirection | null {
  if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.5) return null;
  return dx < 0 ? "left" : "right";
}

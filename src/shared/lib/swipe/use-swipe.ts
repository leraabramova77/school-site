"use client";

import { type TouchEvent, useRef } from "react";
import { type SwipeDirection, swipeDirection } from "./swipe";

/** Горизонтальный свайп пальцем. Мышь не трогаем: на компьютере листают кнопками и клавиатурой. */
export function useSwipe(onSwipe: (direction: SwipeDirection) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart(event: TouchEvent) {
      const touch = event.touches[0];
      start.current =
        event.touches.length === 1 && touch
          ? { x: touch.clientX, y: touch.clientY }
          : null;
    },
    onTouchEnd(event: TouchEvent) {
      const from = start.current;
      const touch = event.changedTouches[0];
      start.current = null;
      if (!from || !touch) return;
      const direction = swipeDirection(
        touch.clientX - from.x,
        touch.clientY - from.y,
      );
      if (direction) onSwipe(direction);
    },
  };
}

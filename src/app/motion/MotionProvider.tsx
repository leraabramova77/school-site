"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Анимации Motion уважают системную настройку «Уменьшить движение». */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

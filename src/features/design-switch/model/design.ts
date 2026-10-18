"use client";

import { useSyncExternalStore } from "react";

/*
 * Вариант оформления для сравнения и будущего A/B-теста: A «Тетрадь», B «Цвет предмета» (основной), C «Спокойный список».
 * Выбор хранится в браузере (localStorage); ссылка с `?design=a|b|c` задаёт и запоминает вариант.
 */
export const DESIGN_VARIANTS = ["a", "b", "c"] as const;
export type DesignVariant = (typeof DESIGN_VARIANTS)[number];
export const DEFAULT_DESIGN: DesignVariant = "b";

export const designLabels: Record<DesignVariant, string> = {
  a: "Тетрадь",
  b: "Цвет предмета",
  c: "Спокойный список",
};

const STORAGE_KEY = "design";
const listeners = new Set<() => void>();

export function parseDesign(value: string | null | undefined) {
  const v = value?.trim().toLowerCase();
  return DESIGN_VARIANTS.find((d) => d === v) ?? null;
}

function read(): DesignVariant {
  try {
    return parseDesign(localStorage.getItem(STORAGE_KEY)) ?? DEFAULT_DESIGN;
  } catch {
    return DEFAULT_DESIGN;
  }
}

export function setDesign(design: DesignVariant) {
  try {
    localStorage.setItem(STORAGE_KEY, design);
  } catch {
    // Хранилище недоступно (приватный режим) — вариант действует до перезагрузки.
  }
  current = design;
  for (const listener of listeners) listener();
}

let current: DesignVariant | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Текущий вариант. На сервере и до гидрации — основной (B). */
export function useDesign(): DesignVariant {
  return useSyncExternalStore(
    subscribe,
    () => {
      current ??= read();
      return current;
    },
    () => DEFAULT_DESIGN,
  );
}

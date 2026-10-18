"use client";

import { useTheme } from "next-themes";
import { useState, useSyncExternalStore } from "react";
import { cn } from "@/shared/lib/cn";
import { formatDayLong } from "@/shared/lib/date";
import { DayStrip, ErrorState } from "@/shared/ui";
import { demoMarkedDays, demoToday, demoWeek } from "../model/demo-data";

export function DayStripDemo() {
  const [selected, setSelected] = useState(demoToday);
  return (
    <div className="flex flex-col gap-2">
      <DayStrip
        week={demoWeek}
        selected={selected}
        onSelect={setSelected}
        today={demoToday}
        marked={demoMarkedDays}
      />
      <p className="text-center text-footnote text-text-muted">
        Выбран: {formatDayLong(selected)}
      </p>
    </div>
  );
}

export function ErrorStateDemo() {
  const [retries, setRetries] = useState(0);
  return (
    <ErrorState
      description={
        retries
          ? `Повторили ${retries} раз — сервер всё ещё молчит.`
          : undefined
      }
      onRetry={() => setRetries((n) => n + 1)}
    />
  );
}

const themes = [
  { value: "light", label: "Светлая" },
  { value: "dark", label: "Тёмная" },
  { value: "system", label: "Как в системе" },
] as const;

const noopSubscribe = () => () => {};

/** Переключатель только для витрины; настоящий — в «Ещё» (задача 0021). */
export function ThemeSwitch() {
  const { theme: stored, setTheme } = useTheme();
  // На сервере тема неизвестна — до гидрации ни один вариант не выбран, иначе разметка не совпадёт.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const theme = mounted ? stored : undefined;
  return (
    <fieldset className="flex gap-1 rounded-xl bg-surface-2 p-1">
      <legend className="sr-only">Тема</legend>
      {themes.map((t) => (
        <label
          key={t.value}
          className={cn(
            "flex h-11 flex-1 cursor-pointer items-center justify-center rounded-lg px-2 text-center text-subhead has-focus-visible:outline-2 has-focus-visible:outline-accent",
            theme === t.value
              ? "bg-surface font-medium shadow-sm"
              : "text-text-muted",
          )}
        >
          <input
            type="radio"
            name="theme"
            value={t.value}
            checked={theme === t.value}
            onChange={() => setTheme(t.value)}
            className="sr-only"
          />
          {t.label}
        </label>
      ))}
    </fieldset>
  );
}

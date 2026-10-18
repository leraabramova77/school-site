"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card } from "@/shared/ui";
import { logout, type ProbeOk, resume } from "../model/api";
import {
  IDLE_STEPS_MIN,
  nextCheckAt,
  type WatchEntry,
  watchVerdict,
} from "../model/session-watch";
import { LoginForm } from "./LoginForm";

const STORAGE_KEY = "netschool-session-watch";

function loadLog(): WatchEntry[] {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    ) as WatchEntry[];
  } catch {
    return [];
  }
}

function saveLog(log: WatchEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    // Журнал просто не переживёт перезагрузку.
  }
}

const time = (ms: number) =>
  new Date(ms).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * Замер срока жизни сессии netschool. Открывается в отдельном браузере (`pnpm netschool:watch`), чтобы обычная
 * работа с сайтом не продлевала сессию. Журнал — в localStorage этого браузера; перезагрузка страницы сессию
 * не трогает: запрос к netschool идёт только по расписанию.
 */
export function SessionWatchPage() {
  const [log, setLog] = useState<WatchEntry[] | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [last, setLast] = useState<ProbeOk | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const append = useCallback((entry: WatchEntry) => {
    setLog((prev) => {
      const next = [...(prev ?? []), entry];
      saveLog(next);
      return next;
    });
  }, []);

  const check = useCallback(async () => {
    const result = await resume();
    if ("needLogin" in result) {
      if (result.expiredAfterIdleMin !== undefined) {
        append({
          at: Date.now(),
          alive: false,
          idleMin: result.expiredAfterIdleMin,
        });
      }
      setNeedLogin(true);
    } else if (result.ok) {
      setLast(result);
      setError(null);
      append({ at: Date.now(), alive: true, idleMin: result.idleMin });
    } else {
      // Сеть или netschool недоступен — это не конец сессии; повторим по таймеру через минуту.
      setError(`${result.error}${result.code ? ` (${result.code})` : ""}`);
    }
  }, [append]);

  // Первый запуск: журнала нет — смотрим, есть ли сессия, и делаем первую отметку.
  useEffect(() => {
    const saved = loadLog();
    setLog(saved);
    if (saved.length === 0) void check();
  }, [check]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

  const due = log ? nextCheckAt(log) : null;
  useEffect(() => {
    if (due === null) return;
    const id = setTimeout(
      () => void check(),
      Math.max(0, due - Date.now()) + (error ? 60_000 : 0),
    );
    return () => clearTimeout(id);
  }, [due, check, error]);

  function restart() {
    saveLog([]);
    setLog([]);
    setLast(null);
    setNeedLogin(false);
    void check();
  }

  async function relogin() {
    await logout();
    saveLog([]);
    setLog([]);
    setLast(null);
    setNeedLogin(true);
  }

  const verdict = log ? watchVerdict(log) : null;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
      <div>
        <h1 className="font-bold text-title-1">Срок жизни сессии</h1>
        <p className="text-footnote text-text-muted">
          Проверяем сессию netschool с растущими паузами:{" "}
          {IDLE_STEPS_MIN.join(", ")} мин. Окно можно свернуть — проверки идут
          сами. Перезагрузка страницы сессию не продлевает.
        </p>
      </div>

      {verdict && (
        <Card className="border-accent p-4 font-semibold text-body">
          {verdict}
        </Card>
      )}

      {needLogin && !verdict && (
        <LoginForm
          submitLabel="Войти и начать замер"
          onResult={(result) => {
            if (result.ok) {
              setNeedLogin(false);
              setLast(result);
              const start = [{ at: Date.now(), alive: true, idleMin: 0 }];
              saveLog(start);
              setLog(start);
            } else {
              setError(result.error);
            }
          }}
        />
      )}

      {error && (
        <Card className="border-destructive p-4 text-body" role="alert">
          {error}
        </Card>
      )}

      {due !== null && (
        <Card className="p-4 text-body">
          Следующая проверка в {time(due)} (через{" "}
          {Math.max(0, Math.ceil((due - now) / 60_000))} мин).
        </Card>
      )}

      {log && log.length > 0 && (
        <Card className="p-4">
          <table className="w-full text-left text-subhead">
            <thead>
              <tr className="text-text-muted">
                <th className="py-1 font-normal">Время</th>
                <th className="py-1 font-normal">Простой</th>
                <th className="py-1 font-normal">Сессия</th>
              </tr>
            </thead>
            <tbody>
              {log.map((entry) => (
                <tr key={entry.at} className="border-border border-t">
                  <td className="py-1">{time(entry.at)}</td>
                  <td className="py-1">
                    {entry.idleMin === 0 ? "вход" : `${entry.idleMin} мин`}
                  </td>
                  <td className="py-1">
                    {entry.alive ? "✅ жива" : "❌ закончилась"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {last && (
        <Card className="p-4 text-footnote text-text-muted">
          Возраст сессии: {last.sessionAgeMin} мин · запрос: {last.durationMs}{" "}
          мс · cookie netschool: {last.cookieNames.join(", ") || "нет"} ·
          записей в неделе: {last.week.items.length}
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {verdict && <Button onClick={relogin}>Новый замер</Button>}
        {!verdict && log && log.length > 0 && (
          <Button variant="secondary" onClick={restart}>
            Сбросить журнал
          </Button>
        )}
      </div>
    </main>
  );
}

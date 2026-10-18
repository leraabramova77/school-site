"use client";

import { useEffect, useState } from "react";
import { Button, Card, Skeleton } from "@/shared/ui";
import { logout, type ProbeResult, resume } from "../model/api";
import { LoginForm } from "./LoginForm";

/** Отладочная страница: вход в netschool и разбор текущей недели. Только в `pnpm dev`. */
export function ProbePage() {
  const [resuming, setResuming] = useState(true);
  const [expiredNote, setExpiredNote] = useState<string | null>(null);
  const [result, setResult] = useState<ProbeResult | null>(null);

  // При открытии — пробуем сохранённую сессию: если она жива, вход не нужен.
  useEffect(() => {
    resume()
      .then((data) => {
        if ("needLogin" in data) {
          if (data.expiredAfterIdleMin !== undefined) {
            setExpiredNote(
              `Сессия netschool закончилась после ${data.expiredAfterIdleMin} мин без запросов — войди заново.`,
            );
          }
        } else {
          setResult(data);
        }
      })
      .finally(() => setResuming(false));
  }, []);

  async function onLogout() {
    await logout();
    setResult(null);
    setExpiredNote(null);
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="font-bold text-title-1">Проверка netschool</h1>
        <p className="text-footnote text-muted-foreground">
          Только для разработки. Логин и пароль уходят в netschool через наш
          локальный сервер и нигде не сохраняются. Сессия netschool хранится в
          зашифрованной httpOnly-cookie.
        </p>
      </div>

      {expiredNote && (
        <Card className="p-4 text-body" role="status">
          {expiredNote}
        </Card>
      )}

      {resuming ? (
        <Skeleton className="h-48 rounded-card" />
      ) : result?.ok ? (
        <Button variant="secondary" onClick={onLogout}>
          Выйти
        </Button>
      ) : (
        <LoginForm
          submitLabel="Войти и загрузить неделю"
          onResult={setResult}
        />
      )}

      {result && !result.ok && (
        <Card className="border-destructive p-4 text-body" role="alert">
          {result.error}{" "}
          {result.code && (
            <code className="text-footnote">({result.code})</code>
          )}
        </Card>
      )}

      {result?.ok && (
        <Card className="flex flex-col gap-3 p-4">
          <p className="text-subhead">
            Загрузка: {result.durationMs} мс · сессии {result.sessionAgeMin} мин
            · cookie: {result.cookieNames.join(", ") || "нет"} · неделя:{" "}
            {result.week.selectedWeek ?? "?"} · недель в списке:{" "}
            {result.week.weeks.length} · PCLID:{" "}
            {result.week.pclid ? "есть" : "нет"}
          </p>
          <p className="text-subhead">
            Записей разобрано: {result.week.items.length}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-footnote">
              <thead>
                <tr>
                  <th className="p-1">Дата</th>
                  <th className="p-1">Предмет</th>
                  <th className="p-1">Тип</th>
                  <th className="p-1">Тема</th>
                  <th className="p-1">Вес</th>
                  <th className="p-1">Оценка</th>
                </tr>
              </thead>
              <tbody>
                {result.week.items.map((item) => (
                  <tr
                    key={`${item.date}-${item.subject}-${item.typeCode}-${item.assignment?.aid ?? item.theme}`}
                    className="border-t border-border align-top"
                  >
                    <td className="p-1 whitespace-nowrap">{item.date}</td>
                    <td className="p-1">{item.subject}</td>
                    <td className="p-1">{item.typeCode}</td>
                    <td className="p-1">{item.theme}</td>
                    <td className="p-1">{item.weight ?? "—"}</td>
                    <td className="p-1">{item.mark ?? item.markRaw ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </main>
  );
}

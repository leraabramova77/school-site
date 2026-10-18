"use client";

import { type FormEvent, useState } from "react";
import type { DiaryWeek } from "@/shared/netschool";
import { Button, Card, Input, PasswordInput } from "@/shared/ui";

type ProbeResult =
  | { ok: true; durationMs: number; cookieNames: string[]; week: DiaryWeek }
  | { ok?: false; error: string; code?: string };

/** Credential Management API есть в Chrome/Edge, но не в типах TypeScript. */
type PasswordCredentialCtor = new (form: HTMLFormElement) => Credential;

/**
 * Просим браузер сохранить пароль после успешного входа. Chrome/Edge — явно через PasswordCredential; Safari и
 * Firefox предлагают сохранить сами, когда форма входа исчезает со страницы после успешного запроса.
 */
async function offerToSavePassword(form: HTMLFormElement): Promise<void> {
  const Ctor = (window as { PasswordCredential?: PasswordCredentialCtor })
    .PasswordCredential;
  if (!Ctor) return;
  try {
    await navigator.credentials.store(new Ctor(form));
  } catch {
    // Пользователь отказался или браузер не дал — ничего страшного.
  }
}

/** Отладочная страница: вход в netschool и разбор текущей недели. Только в `pnpm dev`. */
export function ProbePage() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ProbeResult | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setResult(null);
    try {
      const res = await fetch("/api/dev/netschool-probe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          login: data.get("login"),
          password: data.get("password"),
        }),
      });
      const next = (await res.json()) as ProbeResult;
      if (next.ok) await offerToSavePassword(form);
      setResult(next);
    } catch {
      setResult({ error: "Наш сервер не ответил" });
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="font-bold text-title-1">Проверка netschool</h1>
        <p className="text-footnote text-muted-foreground">
          Только для разработки. Логин и пароль уходят в netschool через наш
          локальный сервер и нигде не сохраняются.
        </p>
      </div>

      {result?.ok ? (
        <Button variant="secondary" onClick={() => setResult(null)}>
          Войти заново
        </Button>
      ) : (
        <Card className="p-4">
          <form
            method="post"
            onSubmit={onSubmit}
            className="flex flex-col gap-3"
          >
            <label htmlFor="probe-login" className="text-subhead">
              Логин
            </label>
            <Input
              id="probe-login"
              name="login"
              autoComplete="username"
              required
            />
            <label htmlFor="probe-password" className="text-subhead">
              Пароль
            </label>
            <PasswordInput
              id="probe-password"
              name="password"
              autoComplete="current-password"
              required
            />
            <Button type="submit" disabled={pending}>
              {pending ? "Вхожу…" : "Войти и загрузить неделю"}
            </Button>
          </form>
        </Card>
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
            Вход и загрузка: {result.durationMs} мс · cookie:{" "}
            {result.cookieNames.join(", ") || "нет"} · неделя:{" "}
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

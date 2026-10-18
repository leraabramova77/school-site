"use client";

import { type FormEvent, useState } from "react";
import { Button, Card, Input, PasswordInput } from "@/shared/ui";
import { PROBE_API, type ProbeResult } from "../model/api";

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

export function LoginForm({
  submitLabel,
  onResult,
}: {
  submitLabel: string;
  onResult: (result: ProbeResult) => void;
}) {
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    try {
      const res = await fetch(PROBE_API, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          login: data.get("login"),
          password: data.get("password"),
        }),
      });
      const result = (await res.json()) as ProbeResult;
      if (result.ok) await offerToSavePassword(form);
      onResult(result);
    } catch {
      onResult({ error: "Наш сервер не ответил" });
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="p-4">
      <form method="post" onSubmit={onSubmit} className="flex flex-col gap-3">
        <label htmlFor="probe-login" className="text-subhead">
          Логин
        </label>
        <Input id="probe-login" name="login" autoComplete="username" required />
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
          {pending ? "Вхожу…" : submitLabel}
        </Button>
      </form>
    </Card>
  );
}

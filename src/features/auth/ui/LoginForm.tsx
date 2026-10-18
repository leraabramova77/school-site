"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, LoaderCircle, School } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { HOME_PATH } from "@/shared/config";
import { Button, Card, Input, PasswordInput } from "@/shared/ui";
import {
  type AuthResponse,
  type LoginValues,
  loginSchema,
} from "../model/login-schema";

/** Credential Management API есть в Chrome/Edge, но не в типах TypeScript. */
type PasswordCredentialCtor = new (form: HTMLFormElement) => Credential;

/**
 * Предлагаем браузеру сохранить пароль (в его собственное хранилище, не к нам). Chrome/Edge — явно, Safari и
 * Firefox — сами, когда после успешного запроса страница уходит с формы входа.
 */
async function offerToSavePassword(form: HTMLFormElement): Promise<void> {
  const Ctor = (window as { PasswordCredential?: PasswordCredentialCtor })
    .PasswordCredential;
  if (!Ctor) return;
  try {
    await navigator.credentials.store(new Ctor(form));
  } catch {
    // Отказался или браузер не дал — вход это не ломает.
  }
}

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values, event) => {
    setServerError(null);
    let result: AuthResponse;
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      result = (await res.json()) as AuthResponse;
    } catch {
      result = {
        ok: false,
        error: "Нет связи. Проверь интернет и попробуй ещё раз.",
      };
    }
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    const form = event?.target;
    if (form instanceof HTMLFormElement) await offerToSavePassword(form);
    router.replace(HOME_PATH);
    router.refresh();
  });

  return (
    <Card className="flex flex-col gap-5 p-5">
      <div className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5">
        <School className="size-5 shrink-0 text-accent" aria-hidden />
        <div className="min-w-0">
          <p className="text-footnote text-text-muted">Школа</p>
          <p className="font-medium text-body">УВК «Рефал»</p>
        </div>
      </div>

      <form
        method="post"
        noValidate
        onSubmit={onSubmit}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login" className="font-medium text-subhead">
            Логин
          </label>
          <Input
            id="login"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            aria-invalid={errors.login ? true : undefined}
            aria-describedby={errors.login ? "login-error" : undefined}
            {...register("login")}
          />
          {errors.login && (
            <p id="login-error" className="text-footnote text-grade-2">
              {errors.login.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="font-medium text-subhead">
            Пароль
          </label>
          <PasswordInput
            id="password"
            enterKeyHint="go"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password && (
            <p id="password-error" className="text-footnote text-grade-2">
              {errors.password.message}
            </p>
          )}
        </div>

        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-grade-2-soft px-3 py-2.5 text-grade-2 text-subhead"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="mt-1 w-full"
        >
          {isSubmitting && (
            <LoaderCircle className="animate-spin" aria-hidden />
          )}
          {isSubmitting ? "Входим…" : "Войти"}
        </Button>
      </form>
    </Card>
  );
}

import "server-only";
import { sealData, unsealData } from "iron-session";
import { cookies } from "next/headers";
import { z } from "zod";
import { sessionCookieName } from "@/shared/config";
import { getServerEnv } from "@/shared/server";

/*
 * Сессия нашего сайта (ТЗ-1 §4.3): сессия старого сайта (его cookie и токен AT) в зашифрованной и подписанной cookie.
 * Пароля здесь нет и не будет. Cookie httpOnly — скрипты страницы её не видят; расшифровать её может только наш
 * сервер ключом SESSION_SECRET. Подделанная или испорченная cookie просто не принимается.
 */

const sessionSchema = z.object({
  ns: z.object({
    cookies: z.record(z.string(), z.string()),
    at: z.string().min(1),
  }),
  /** Когда вошли и когда последний раз ходили в netschool (мс) — чтобы понимать срок жизни сессии старого сайта. */
  createdAt: z.number(),
  lastUsedAt: z.number(),
});

export type SessionData = z.infer<typeof sessionSchema>;

/**
 * Сколько живёт наша cookie: не дольше токена netschool (`ESRNSec` — сутки, ТЗ-1 §4.2). Сессия netschool без
 * запросов умирает раньше — тогда просим войти заново.
 */
export const SESSION_TTL_SECONDS = 24 * 60 * 60;

/** Имя и флаги cookie сессии; `__Host-` и Secure — только в проде (см. `sessionCookieName`). */
export function sessionCookie(
  production = process.env.NODE_ENV === "production",
) {
  return {
    name: sessionCookieName(production),
    options: {
      httpOnly: true,
      secure: production,
      sameSite: "lax" as const,
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    },
  };
}

export async function sealSession(
  data: SessionData,
  password: string,
): Promise<string> {
  return sealData(data, { password, ttl: SESSION_TTL_SECONDS });
}

/** Расшифровка и проверка формы. Любая проблема (чужой ключ, подделка, истёк срок) → `null`. */
export async function unsealSession(
  seal: string,
  password: string,
): Promise<SessionData | null> {
  try {
    const data = await unsealData<unknown>(seal, {
      password,
      ttl: SESSION_TTL_SECONDS,
    });
    const parsed = sessionSchema.safeParse(data);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function readSession(): Promise<SessionData | null> {
  const value = (await cookies()).get(sessionCookie().name)?.value;
  return value ? unsealSession(value, getServerEnv().SESSION_SECRET) : null;
}

export async function writeSession(data: SessionData): Promise<void> {
  const { name, options } = sessionCookie();
  (await cookies()).set(
    name,
    await sealSession(data, getServerEnv().SESSION_SECRET),
    options,
  );
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(sessionCookie().name);
}

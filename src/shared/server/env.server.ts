import "server-only";
import { z } from "zod";

/** Значения-заглушки из правил .env: переменная считается незаданной. */
const UNSET = new Set(["not-required", "required-not-set", ""]);

const unsetToUndefined = (v: unknown) =>
  typeof v === "string" && UNSET.has(v.trim()) ? undefined : v;

const serverEnvSchema = z.object({
  SESSION_SECRET: z.preprocess(
    unsetToUndefined,
    z
      .string({ error: "не задан" })
      .min(32, "короче 32 символов")
      // Заглушка из .env.example длиннее 32 символов — отсекаем её явно.
      .refine(
        (v) => !v.startsWith("your-"),
        "оставлена заглушка из .env.example",
      ),
  ),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Проверяет серверные переменные. В тексте ошибки — только имена переменных и причина, без значений.
 * Экспортирована для тестов; в коде используй getServerEnv().
 */
export function parseServerEnv(
  raw: Record<string, string | undefined>,
): ServerEnv {
  const result = serverEnvSchema.safeParse(raw);
  if (!result.success) {
    const problems = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(
      `Неверные переменные окружения — ${problems}. Образец — .env.example.`,
    );
  }
  return result.data;
}

let cached: ServerEnv | undefined;

/** Переменные окружения сервера, проверенные при первом обращении. */
export function getServerEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);
  return cached;
}

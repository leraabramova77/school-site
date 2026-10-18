import { z } from "zod";

/** Форма входа — одна схема для формы в браузере и для API. */
export const loginSchema = z.object({
  login: z
    .string()
    .trim()
    .min(1, "Введи логин")
    .max(100, "Слишком длинный логин"),
  password: z
    .string()
    .min(1, "Введи пароль")
    .max(200, "Слишком длинный пароль"),
});

export type LoginValues = z.infer<typeof loginSchema>;

/** Ответ API входа и выхода: клиенту — только успех или понятный текст ошибки. */
export type AuthResponse = { ok: true } | { ok: false; error: string };

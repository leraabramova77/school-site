import "server-only";
import { parse } from "node-html-parser";
import { REFAL_SCHOOL } from "./config";
import { NetschoolError } from "./errors";
import {
  type CookieJar,
  type NetschoolResponse,
  netschoolRequest,
} from "./http.server";
import { hashPassword } from "./password.server";

/** Сессия старого сайта: cookie + токен `AT`. Живёт только в зашифрованной cookie нашего сайта. */
export type NetschoolSession = { cookies: CookieJar; at: string };

export type LoginForm = { salt: string; lt: string; ver: string };

function hiddenValue(html: string, name: string): string | undefined {
  const input = parse(html).querySelector(`input[name="${name}"]`);
  return input?.getAttribute("value") ?? undefined;
}

/** Соль, LT и VER со страницы входа (docs/api-map.md §1.1). */
export function parseLoginForm(html: string): LoginForm {
  const salt = /\bsalt\s*:\s*['"]([^'"]+)['"]/.exec(html)?.[1];
  const lt = hiddenValue(html, "LT");
  const ver = hiddenValue(html, "VER");
  if (!salt || !lt || !ver) throw new NetschoolError("unexpected_response");
  return { salt, lt, ver };
}

/** `AT` из ответа на вход (автоформа) или со страницы после входа. Нет `AT` — вход не удался. */
export function parseAt(html: string): string | undefined {
  const at =
    hiddenValue(html, "AT") ?? /strATTok\s*=\s*['"](\d+)['"]/.exec(html)?.[1];
  return at && /^\d{6,64}$/.test(at) ? at : undefined;
}

export type LoginResult = {
  session: NetschoolSession;
  postlogin: NetschoolResponse;
};

/**
 * Вход в старый сайт. Пароль используется только для расчёта хеша и нигде не сохраняется.
 * `postlogin` отдаётся наружу только для отладочной страницы разработки (структура без данных).
 */
export async function loginToNetschool(
  login: string,
  password: string,
): Promise<LoginResult> {
  const cookies: CookieJar = {};
  const page = await netschoolRequest(cookies, "/", { method: "GET" });
  const form = parseLoginForm(page.html);
  const { PW, PW2 } = hashPassword(password, form.salt);
  const postlogin = await netschoolRequest(cookies, "/asp/postlogin.asp", {
    method: "POST",
    retry: false,
    form: {
      LoginType: "1",
      ...REFAL_SCHOOL,
      UN: login,
      PW,
      PW2,
      LT: form.lt,
      VER: form.ver,
      ECardID: "",
    },
  });
  const at = parseAt(postlogin.html);
  if (!at) throw new NetschoolError("bad_credentials");
  // Браузер сразу отправляет автоформу из ответа (ViewAnnouncements.asp) — повторяем, чтобы сессия стала полной.
  const auto = parseAutoForm(postlogin.html);
  if (auto)
    await netschoolRequest(cookies, auto.action, {
      method: "POST",
      retry: false,
      form: auto.fields,
    });
  return { session: { cookies, at }, postlogin };
}

/** Форма с `action` и скрытыми полями, которую страница отправляет скриптом сразу после загрузки. */
export function parseAutoForm(
  html: string,
): { action: string; fields: Record<string, string> } | undefined {
  const form = parse(html).querySelector("form[action]");
  const action = form?.getAttribute("action");
  if (!form || !action?.startsWith("/asp/")) return undefined;
  const fields: Record<string, string> = {};
  for (const input of form.querySelectorAll("input[name]")) {
    fields[input.getAttribute("name") ?? ""] =
      input.getAttribute("value") ?? "";
  }
  return { action, fields };
}

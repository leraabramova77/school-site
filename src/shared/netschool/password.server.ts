import "server-only";
import { createHash } from "node:crypto";

/*
 * Хеш пароля для входа в netschool — повторяет `hexMD5_` из /asp/md5r.min.js (docs/api-map.md §1.3):
 *   PW2 = md5(salt + md5(пароль)),  PW = PW2 обрезанный до длины пароля.
 * Символы переводятся в байты так же, как в скрипте сайта, а не настоящей кодировкой windows-1251:
 * кириллица — как в windows-1251, коды до 255 — как есть, всё прочее (эмодзи, «€») даёт 0, иначе хеш не совпадёт с тем, что ждёт сервер.
 * Пароль и хеши нигде не сохраняются и не логируются.
 */

function siteCharCode(code: number): number {
  if (code <= 0xff) return code;
  if (code >= 0x410 && code <= 0x44f) return code - 848; // А–я
  if (code === 0x401) return 168; // Ё
  if (code === 0x451) return 184; // ё
  if (code === 0x2116) return 185; // №
  return 0;
}

/** Байты строки по правилам скрипта сайта: по одному на каждую UTF-16 единицу (как charCodeAt). */
export function toSiteBytes(text: string): Uint8Array {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++)
    bytes[i] = siteCharCode(text.charCodeAt(i));
  return bytes;
}

function md5Hex(bytes: Uint8Array): string {
  return createHash("md5").update(bytes).digest("hex");
}

export type PasswordHash = { PW: string; PW2: string };

/** Поля `PW` и `PW2` формы входа. `salt` — `constants.salt` со страницы входа. */
export function hashPassword(password: string, salt: string): PasswordHash {
  const PW2 = md5Hex(toSiteBytes(salt + md5Hex(toSiteBytes(password))));
  return { PW: PW2.slice(0, password.length), PW2 };
}

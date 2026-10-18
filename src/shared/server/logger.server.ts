import "server-only";

/*
 * Безопасный логгер (ТЗ-1 §4.5). В лог попадают только поля из белого списка — метод, путь без query, статус,
 * длительность, код события. Тела, заголовки, cookie, AT, логины и тексты ошибок старого сайта сюда не проходят:
 * всё, чего нет в списке или что не похоже на ожидаемое значение, молча отбрасывается.
 */

export type LogFields = {
  method?: string;
  /** Путь или URL: query, hash и хост будут отрезаны. */
  path?: string;
  status?: number;
  durationMs?: number;
  /** Наш внутренний код: `login_failed`, `netschool_timeout`. */
  code?: string;
};

type SafeFields = Record<string, string | number>;

const METHOD = /^[A-Z]{3,7}$/;
const CODE = /^[a-z0-9_.-]{1,64}$/i;
const EVENT = /^[a-z0-9_.:-]{1,64}$/i;
const IDENTIFIER = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;

function safePath(value: string): string | undefined {
  let path = value;
  try {
    // Полный URL → только путь; относительный путь URL дополнит фиктивным хостом.
    path = new URL(value, "http://x").pathname;
  } catch {
    return undefined;
  }
  return path.slice(0, 200);
}

/** Оставляет только разрешённые поля с правдоподобными значениями. Экспортирована для тестов. */
export function sanitizeLogFields(fields: Record<string, unknown>): SafeFields {
  const out: SafeFields = {};
  const { method, path, status, durationMs, code } = fields;
  if (typeof method === "string" && METHOD.test(method.toUpperCase()))
    out.method = method.toUpperCase();
  if (typeof path === "string") {
    const p = safePath(path);
    if (p) out.path = p;
  }
  if (
    typeof status === "number" &&
    Number.isInteger(status) &&
    status >= 100 &&
    status <= 599
  ) {
    out.status = status;
  }
  if (
    typeof durationMs === "number" &&
    Number.isFinite(durationMs) &&
    durationMs >= 0
  ) {
    out.durationMs = Math.round(durationMs);
  }
  if (typeof code === "string" && CODE.test(code)) out.code = code;
  return out;
}

/** Строка лога: JSON с уровнем, событием и безопасными полями. Экспортирована для тестов. */
export function formatLogLine(
  level: "info" | "warn" | "error",
  event: string,
  fields: LogFields = {},
  error?: unknown,
): string {
  const entry: SafeFields = {
    level,
    event: EVENT.test(event) ? event : "invalid_event",
    ...sanitizeLogFields(fields),
  };
  // От ошибки — только имя класса: сообщение может содержать URL с токеном или ответ старого сайта.
  if (error instanceof Error && IDENTIFIER.test(error.name))
    entry.errorName = error.name;
  return JSON.stringify(entry);
}

/* biome-ignore-start lint/suspicious/noConsole: единственное место, где сервер пишет в консоль. */
export const logger = {
  info(event: string, fields?: LogFields) {
    console.info(formatLogLine("info", event, fields));
  },
  warn(event: string, fields?: LogFields, error?: unknown) {
    console.warn(formatLogLine("warn", event, fields, error));
  },
  error(event: string, fields?: LogFields, error?: unknown) {
    console.error(formatLogLine("error", event, fields, error));
  },
};
/* biome-ignore-end lint/suspicious/noConsole: конец логгера. */

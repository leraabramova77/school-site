/**
 * Ошибки клиента netschool. Код — для логики и логов, сообщение — общими словами для человека (ТЗ-1 §4.5):
 * ни ответов старого сайта, ни технических подробностей.
 */
export type NetschoolErrorCode =
  | "bad_credentials"
  | "session_expired"
  | "timeout"
  | "unavailable"
  | "unexpected_response";

const messages: Record<NetschoolErrorCode, string> = {
  bad_credentials: "Неверный логин или пароль",
  session_expired: "Сессия закончилась — войди заново",
  timeout: "Сайт школы не отвечает",
  unavailable: "Сайт школы недоступен",
  unexpected_response: "Сайт школы ответил непонятно — попробуй позже",
};

export class NetschoolError extends Error {
  override name = "NetschoolError";
  constructor(readonly code: NetschoolErrorCode) {
    super(messages[code]);
  }
}

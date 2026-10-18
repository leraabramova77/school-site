/** Старый сайт. Ходит к нему только наш сервер (ТЗ-1 §4.2). */
export const NETSCHOOL_ORIGIN = "https://netschool.refal.kg";

/** УВК «Рефал» в справочнике школ сайта (публичные данные, docs/api-map.md §1.2). */
export const REFAL_SCHOOL = {
  CID: "3",
  SID: "88",
  PID: "1",
  CN: "7",
  SFT: "2",
  SCID: "2",
} as const;

export const REQUEST_TIMEOUT_MS = 10_000;

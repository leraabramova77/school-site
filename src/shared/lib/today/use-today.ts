import { useSyncExternalStore } from "react";
import { type IsoDate, todayIso } from "@/shared/lib/date";

const subscribe = () => () => {};

/**
 * Сегодняшняя дата устройства. На сервере — `null`: часовой пояс сервера не совпадает с поясом ученика,
 * поэтому всё, что зависит от «сегодня», рисуем после гидрации.
 */
export function useToday(): IsoDate | null {
  return useSyncExternalStore(subscribe, todayIso, () => null);
}

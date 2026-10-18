// Отдельно от `@/shared/lib/date`: хук React нельзя тянуть в серверные модули, которые считают даты.
export { useToday } from "./use-today";

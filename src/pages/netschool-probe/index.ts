// Отладочная страница netschool — только для `pnpm dev`. Обработчики — серверные, импортировать только из route.
export { probeLogin, probeLogout, probeResume } from "./api/probe.server";
export { ProbePage } from "./ui/ProbePage";

// Клиент старого сайта netschool — только для сервера (сетевые модули с `import "server-only"`).
export type { DiaryItem, DiaryWeek } from "./diary";
export { fetchDiaryWeek } from "./diary.server";
export { NetschoolError, type NetschoolErrorCode } from "./errors";
export type { NetschoolSession } from "./login.server";
export { loginToNetschool } from "./login.server";
export { logoutFromNetschool } from "./logout.server";
export { hashPassword, type PasswordHash } from "./password.server";
export { htmlSkeleton } from "./skeleton";

// Открывает страницу замера срока жизни сессии netschool в отдельном браузере Playwright со своим профилем
// (cookie, localStorage — свои, не пересекаются с обычным браузером). Профиль — в debug/ (в .gitignore),
// поэтому вход нужен один раз, а после перезапуска скрипта журнал продолжается.
// Запуск: `pnpm netschool:watch [адрес dev-сервера]`, по умолчанию http://localhost:5000. Нужен запущенный `pnpm dev`.
import path from "node:path";
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:5000";
const profile = path.join(process.cwd(), "debug", "session-watch-profile");

const context = await chromium.launchPersistentContext(profile, {
  headless: false,
  viewport: { width: 420, height: 820 },
  // Свёрнутое окно не должно засыпать: иначе таймеры проверок сдвигаются.
  args: [
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
  ],
});
const page = context.pages()[0] ?? (await context.newPage());
await page.goto(`${base}/dev/netschool/session`);
console.log(
  `[netschool-watch] окно открыто: ${base}/dev/netschool/session. Закрой окно, чтобы остановить.`,
);
await new Promise((resolve) => context.on("close", resolve));

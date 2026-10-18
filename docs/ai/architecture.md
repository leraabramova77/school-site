# Архитектура — school-site

## Слои FSD
`src/app` → `src/pages` → `src/widgets` → `src/features` → `src/entities` → `src/shared`.

- Импорт только вниз; слайсы одного слоя друг друга не импортируют.
- Наружу слайс отдаёт только `index.ts`; сегменты — `ui`, `model`, `api`, `lib`, `config`.
- Next.js `app/` в корне (роутинг) тонкий: реэкспортирует страницы из `src/pages`. Поскольку корневой `app/` есть, Next игнорирует `src/app` и `src/pages` — это слои FSD, а не роуты.
- Серверный код (запросы к netschool, сессия, env, логгер) — файлы `*.server.ts` с `import "server-only"` в сегментах `api`/`lib`/`config`. Общее серверное — `@/shared/server`: `getServerEnv()` (Zod, «not-required»/«required-not-set» = не задано) и `logger` с белым списком полей. `console.*` на сервере — только через `logger`.
- Клиент старого сайта — `@/shared/netschool` (вход, дневник, разбор HTML; парсеры — чистые функции с тестами на выдуманных фикстурах). Сессия нашего сайта — `@/shared/session`: сессия netschool (cookie + `AT`) в зашифрованной httpOnly-cookie (iron-session, ключ `SESSION_SECRET`), пароля в ней нет, срок — сутки. Вход и выход — `@/features/auth` (`POST /api/auth/login|logout`: Origin, лимит 5 попыток за 10 мин с IP из `@/shared/lib/rate-limit`, ответ только `{ ok }`, `no-store`). Проверка Origin, IP клиента и `NO_STORE` — в `@/shared/server`. `proxy.ts` (бывший middleware) — только «оптимистичная» проверка наличия cookie: без неё разделы из `PROTECTED_PATHS` (`@/shared/config`) ведут на `/login`, с ней `/login` → `/today`; `matcher` — литерал, тест сверяет его со списком. Экран раздела — `Screen` из `@/widgets/app-shell`. API с личными данными — через `respondWithSession` (`@/shared/session`): сессия → netschool → продление cookie, ответ `{ ok, data }` или `{ ok: false, error, needLogin? }` с `no-store`. HTML от учителей — только через `sanitizeHtml` (`@/shared/lib/sanitize`). Дневник — `@/entities/diary`: хуки TanStack Query (`useDiaryWeek`, `useAssignment`) и типы; обработчики `GET /api/diary`, `GET /api/assignment` — из `@/entities/diary/server` (только для route handlers, иначе `server-only` попадёт в клиент). Клиентские запросы — `getApi` из `@/shared/api` (`ApiError` с `needLogin`); `QueryProvider` (`@/app/query`) при `needLogin` перезагружает страницу на `/login`. Готовый HTML учителя вставляется только через `SafeHtml` (`@/shared/ui`). «Сегодня» на устройстве — `useToday` (`@/shared/lib/today`, отдельно от `@/shared/lib/date`, которую импортирует сервер). Отладка на реальных данных — `/dev/netschool` и `/dev/netschool/session` (только `pnpm dev`, в проде 404).
- Проверка границ — `pnpm lint:fsd` (Steiger).

## Данные
- Серверные данные — TanStack Query (хуки в `api` слайса), без копий в клиентском сторе.
- Клиентское состояние — Zustand в `model` слайса; фильтры и пагинация — в URL (nuqs).
- Все внешние данные (HTTP-ответы, env, файлы) — через Zod-схемы.

## Внешние сервисы
- **netschool.refal.kg** — «Сетевой Город. Образование» 5.0 (классический ASP, REST `/webapi/` выключен). Источник всех данных дневника: POST-формы с токеном `AT`, ответы — HTML, разбираются на сервере. Ходит только сервер. Карта — `docs/api-map.md`.
- **Vercel** — хостинг (Hobby). Секреты — Environment Variables, отмечены Sensitive.
- Своей БД в ТЗ-1 нет: сессия — зашифрованная cookie.

## Логирование
Только безопасный логгер с белым списком полей (метод, путь без query, статус, длительность) — задача 0008. Тела запросов, cookie, `at`, пароли не логируются никогда. Журнал — Vercel → Logs.

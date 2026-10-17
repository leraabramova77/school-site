# Документация для AI — school-site

## Порядок чтения
1. `docs/PRD.md` — что за продукт, требования, решения, «Очередь задач».
2. `docs/ai/architecture.md` — слои FSD, данные, внешние сервисы.
3. `docs/ai/conventions.md` — нейминг, тесты, Git, PR, Definition of Done.
4. `docs/ai/workflow.md` — конвейер `/feature`, `/bug`, `/flow`.
5. README модуля, который правишь (если есть).

`docs/HISTORY.md` целиком не читать и в контекст не подключать — только дописывать строку задачи.

## Команды
| Команда | Что делает |
|---|---|
| `pnpm dev` | dev-сервер на первом свободном порту от 5000 |
| `pnpm check` | Biome, Steiger (FSD), typecheck, Vitest — то же, что CI без сборки |
| `pnpm build` | production-сборка |
| `pnpm -s wt next` | номер новой задачи |
| `pnpm wt new <тип>/NNNN-slug` | worktree задачи |
| `pnpm wt serve` / `stop` / `list` / `remove` / `prune` | сервер worktree и уборка |

## Нельзя
- Коммитить и пушить в `main` напрямую — только ветка + PR.
- Создавать worktree встроенными `EnterWorktree` / `--worktree` / голым `git worktree add` — только `pnpm wt new`.
- Выводить значения из `.env.local`, коммитить `.env.local`.
- Использовать чужие аккаунты, почты и репозитории (см. глобальный `CLAUDE.md`).
- Делать платные действия без согласия Леры.

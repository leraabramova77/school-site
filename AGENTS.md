# Правила для AI-агентов

- Перед работой прочитай `docs/ai/README.md` — там порядок чтения документации, команды и запреты.
- Если проект на Next.js: перед кодом сверяйся с документацией установленной версии в `node_modules/next/dist/docs/`,
  а не с памятью — API между версиями меняется.
- Стек, FSD, порт 5000+, правила `.env` и Git — из глобального `CLAUDE.md` и `docs/ai/conventions.md`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

// Чистая логика `pnpm wt` (scripts/worktree.ts): разбор git/gh, номера задач, решение об уборке worktree.
// Без файловой системы и процессов — покрыта тестами в worktreePlan.test.ts.
import path from "node:path";

/** Ветка задачи: `<тип>/NNNN-slug`; группа 2 — номер задачи. */
export const BRANCH_PATTERN =
  /^(feature|bug|hotfix|chore)\/(\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Что линкуется в worktree, если в репозитории нет .claude/worktree-links.json. */
export const DEFAULT_LINKS = [".env.local"];

export interface LinkEntry {
  path: string;
  mode: "link" | "copy";
}

export interface WorktreeEntry {
  path: string;
  branch: string | null;
  main: boolean;
}

export interface PullRequestInfo {
  number: number;
  headRefName: string;
  headRefOid: string;
  state: "OPEN" | "CLOSED" | "MERGED";
  mergedAt: string | null;
  closedAt: string | null;
}

export interface PruneInput {
  branch: string | null;
  dirty: boolean;
  unpushed: number;
  current: boolean;
  pr: PullRequestInfo | null;
  lastCommitAt: number;
  now: number;
  olderThanMs: number;
  staleMs: number;
}

export interface PruneDecision {
  action: "remove" | "keep";
  reason: string;
  /** Нужна ли пользователю: показать в «Worktree требуют решения». */
  attention: boolean;
}

/** Командный список + личный, без дублей; строка — ссылка, `{ path, mode: "copy" }` — копия. */
export function normalizeLinks(team: unknown, local: unknown): LinkEntry[] {
  const result = new Map<string, LinkEntry>();
  for (const list of [team, local]) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (typeof item === "string" && item.trim())
        result.set(item, { path: item, mode: "link" });
      else if (
        item &&
        typeof item === "object" &&
        typeof (item as { path?: unknown }).path === "string"
      ) {
        const { path: p, mode } = item as { path: string; mode?: unknown };
        result.set(p, { path: p, mode: mode === "copy" ? "copy" : "link" });
      }
    }
  }
  return [...result.values()];
}

/** `git worktree list --porcelain` → записи; первая — основной checkout. */
export function parseWorktreeList(porcelain: string): WorktreeEntry[] {
  const entries: WorktreeEntry[] = [];
  for (const block of porcelain.split(/\r?\n\r?\n/)) {
    const lines = block.split(/\r?\n/).filter(Boolean);
    const worktree = lines.find((l) => l.startsWith("worktree "));
    if (!worktree) continue;
    const branchLine = lines.find((l) => l.startsWith("branch "));
    entries.push({
      path: path.resolve(worktree.slice("worktree ".length)),
      branch: branchLine
        ? branchLine.slice("branch ".length).replace(/^refs\/heads\//, "")
        : null,
      main: entries.length === 0,
    });
  }
  return entries;
}

/** Папка worktree: `<репозиторий>_<метка>`, метка — последний сегмент ветки или `--name`. */
export function worktreeFolderName(
  repo: string,
  branch: string,
  name?: string,
): string {
  const label = (name ?? branch.split("/").pop() ?? branch)
    .trim()
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return `${repo}_${label || "worktree"}`;
}

/** Номера из таблицы «Задачи» docs/HISTORY.md (`| 0012 | …`) и из имён веток задач (в т.ч. `origin/…`). */
export function usedTaskNumbers(
  history: string,
  branches: string[],
): Set<number> {
  const used = new Set<number>();
  for (const match of history.matchAll(/^\|\s*(\d{4})\s*\|/gm))
    used.add(Number(match[1]));
  for (const branch of branches) {
    const match = /(?:^|\/)(?:feature|bug|hotfix|chore)\/(\d{4})-/.exec(
      branch.trim(),
    );
    if (match) used.add(Number(match[1]));
  }
  return used;
}

export function nextTaskNumber(used: Set<number>): string {
  const max = used.size ? Math.max(...used) : 0;
  return String(max + 1).padStart(4, "0");
}

/** `90m`, `24h`, `3d` → миллисекунды; иначе null. */
export function parseDuration(text: string): number | null {
  const match = /^(\d+)\s*([mhd])$/.exec(text.trim());
  if (!match) return null;
  const unit = { m: 60_000, h: 3_600_000, d: 86_400_000 }[
    match[2] as "m" | "h" | "d"
  ];
  return Number(match[1]) * unit;
}

/** Последний PR на ветку: открытый важнее закрытого, иначе — с большим номером. */
export function latestPrByBranch(
  list: PullRequestInfo[],
): Map<string, PullRequestInfo> {
  const result = new Map<string, PullRequestInfo>();
  for (const pr of list) {
    const prev = result.get(pr.headRefName);
    if (
      !prev ||
      (pr.state === "OPEN" && prev.state !== "OPEN") ||
      ((pr.state === "OPEN") === (prev.state === "OPEN") &&
        pr.number > prev.number)
    )
      result.set(pr.headRefName, pr);
  }
  return result;
}

/** Удалить ли worktree при `pnpm wt prune`. Удаляет только влитое давно, чистое и запушенное. */
export function planPrune(input: PruneInput): PruneDecision {
  const keep = (reason: string, attention = false): PruneDecision => ({
    action: "keep",
    reason,
    attention,
  });
  if (input.current) return keep("текущий worktree сессии");
  if (!input.branch) return keep("detached HEAD", true);
  const { pr } = input;
  if (pr?.state === "MERGED") {
    const mergedAt = pr.mergedAt ? Date.parse(pr.mergedAt) : input.now;
    if (input.dirty || input.unpushed)
      return keep(
        `PR #${pr.number} влит, но есть ${input.dirty ? "незакоммиченные изменения" : `незапушенные коммиты (${input.unpushed})`}`,
        true,
      );
    if (input.now - mergedAt < input.olderThanMs)
      return keep(`PR #${pr.number} влит недавно`);
    return {
      action: "remove",
      reason: `PR #${pr.number} влит`,
      attention: false,
    };
  }
  if (pr?.state === "CLOSED")
    return keep(`PR #${pr.number} закрыт без мержа`, true);
  if (pr?.state === "OPEN") return keep(`PR #${pr.number} открыт`);
  if (input.now - input.lastCommitAt > input.staleMs)
    return keep(
      `нет PR, последний коммит ${Math.floor((input.now - input.lastCommitAt) / 86_400_000)} дн. назад`,
      true,
    );
  return keep("нет PR, работа идёт");
}

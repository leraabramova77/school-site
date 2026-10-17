import { describe, expect, it } from "vitest";
import {
  BRANCH_PATTERN,
  latestPrByBranch,
  nextTaskNumber,
  normalizeLinks,
  type PullRequestInfo,
  parseDuration,
  parseWorktreeList,
  planPrune,
  usedTaskNumbers,
  worktreeFolderName,
} from "./worktreePlan";

const DAY = 86_400_000;
const pr = (over: Partial<PullRequestInfo>): PullRequestInfo => ({
  number: 1,
  headRefName: "feature/0001-x",
  headRefOid: "abc",
  state: "OPEN",
  mergedAt: null,
  closedAt: null,
  ...over,
});
const base = {
  branch: "feature/0001-x",
  dirty: false,
  unpushed: 0,
  current: false,
  pr: null,
  lastCommitAt: 0,
  now: 30 * DAY,
  olderThanMs: DAY,
  staleMs: 14 * DAY,
};

describe("worktreePlan", () => {
  it("принимает только ветки вида тип/NNNN-slug", () => {
    expect(BRANCH_PATTERN.exec("feature/0012-sort-memory")?.[2]).toBe("0012");
    expect(BRANCH_PATTERN.test("fix/12-x")).toBe(false);
    expect(BRANCH_PATTERN.test("chore/0001-Upper")).toBe(false);
  });

  it("считает следующий номер по журналу и веткам", () => {
    const history =
      "| Номер | Задача |\n|---|---|\n| 0001 | старт |\n| 0003 | ещё |\n";
    const used = usedTaskNumbers(history, [
      "main",
      "origin/bug/0007-x",
      "chore/0004-y",
    ]);
    expect([...used].sort()).toEqual([1, 3, 4, 7]);
    expect(nextTaskNumber(used)).toBe("0008");
    expect(nextTaskNumber(new Set())).toBe("0001");
  });

  it("разбирает git worktree list --porcelain", () => {
    const list = parseWorktreeList(
      "worktree /repo\nHEAD 1\nbranch refs/heads/main\n\nworktree /repo_0002-x\nHEAD 2\nbranch refs/heads/feature/0002-x\n\nworktree /repo_d\nHEAD 3\ndetached\n",
    );
    expect(list.map((w) => [w.branch, w.main])).toEqual([
      ["main", true],
      ["feature/0002-x", false],
      [null, false],
    ]);
  });

  it("собирает список ссылок без дублей", () => {
    expect(
      normalizeLinks(
        [".env.local", "private"],
        [{ path: "private", mode: "copy" }, 5],
      ),
    ).toEqual([
      { path: ".env.local", mode: "link" },
      { path: "private", mode: "copy" },
    ]);
  });

  it("называет папку по последнему сегменту ветки", () => {
    expect(worktreeFolderName("app", "feature/0012-sort")).toBe(
      "app_0012-sort",
    );
    expect(worktreeFolderName("app", "feature/0012-sort", "моя задача")).toBe(
      "app_моя-задача",
    );
  });

  it("разбирает длительности", () => {
    expect(parseDuration("90m")).toBe(90 * 60_000);
    expect(parseDuration("3d")).toBe(3 * DAY);
    expect(parseDuration("1w")).toBeNull();
  });

  it("берёт открытый PR ветки, иначе последний", () => {
    const map = latestPrByBranch([
      pr({ number: 5, state: "CLOSED" }),
      pr({ number: 3, state: "OPEN" }),
      pr({ number: 9, headRefName: "b", state: "MERGED" }),
    ]);
    expect(map.get("feature/0001-x")?.number).toBe(3);
    expect(map.get("b")?.number).toBe(9);
  });

  it("удаляет только давно влитое, чистое и запушенное", () => {
    const merged = pr({
      state: "MERGED",
      mergedAt: new Date(2 * DAY).toISOString(),
    });
    expect(planPrune({ ...base, pr: merged }).action).toBe("remove");
    expect(planPrune({ ...base, pr: merged, dirty: true })).toMatchObject({
      action: "keep",
      attention: true,
    });
    expect(planPrune({ ...base, pr: merged, current: true }).action).toBe(
      "keep",
    );
    const fresh = pr({
      state: "MERGED",
      mergedAt: new Date(30 * DAY - 1000).toISOString(),
    });
    expect(planPrune({ ...base, pr: fresh })).toMatchObject({
      action: "keep",
      attention: false,
    });
  });

  it("просит решения по закрытым PR и брошенным веткам", () => {
    expect(planPrune({ ...base, pr: pr({ state: "CLOSED" }) }).attention).toBe(
      true,
    );
    expect(planPrune({ ...base }).attention).toBe(true);
    expect(planPrune({ ...base, lastCommitAt: 29 * DAY }).attention).toBe(
      false,
    );
  });
});

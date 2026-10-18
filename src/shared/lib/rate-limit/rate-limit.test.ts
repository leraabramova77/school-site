import { describe, expect, it } from "vitest";
import { createMemoryRateLimiter } from "./rate-limit";

describe("createMemoryRateLimiter", () => {
  it("5 попыток проходят, 6-я — отказ с временем ожидания", () => {
    let t = 0;
    const limiter = createMemoryRateLimiter({
      limit: 5,
      windowMs: 600_000,
      now: () => t,
    });
    for (let i = 0; i < 5; i++) expect(limiter.hit("ip").ok).toBe(true);
    t = 60_000;
    expect(limiter.hit("ip")).toEqual({ ok: false, retryAfterSec: 540 });
  });

  it("окно сдвигается: старые попытки забываются", () => {
    let t = 0;
    const limiter = createMemoryRateLimiter({
      limit: 1,
      windowMs: 1000,
      now: () => t,
    });
    expect(limiter.hit("ip").ok).toBe(true);
    expect(limiter.hit("ip").ok).toBe(false);
    t = 1000;
    expect(limiter.hit("ip").ok).toBe(true);
  });

  it("ключи независимы", () => {
    const limiter = createMemoryRateLimiter({ limit: 1, windowMs: 1000 });
    expect(limiter.hit("a").ok).toBe(true);
    expect(limiter.hit("b").ok).toBe(true);
  });
});

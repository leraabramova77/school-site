import { describe, expect, it } from "vitest";
import { parseServerEnv } from "./env.server";

const secret = "k".repeat(44);

describe("parseServerEnv", () => {
  it("принимает нормальный секрет", () => {
    expect(parseServerEnv({ SESSION_SECRET: secret }).SESSION_SECRET).toBe(
      secret,
    );
  });

  it.each([
    ["нет переменной", undefined],
    ["required-not-set", "required-not-set"],
    ["not-required", "not-required"],
    ["пустая", ""],
    ["короткий", "short"],
    ["заглушка из .env.example", "your-random-32-byte-base64-secret"],
  ])("отклоняет: %s", (_, value) => {
    expect(() => parseServerEnv({ SESSION_SECRET: value })).toThrow(
      /SESSION_SECRET/,
    );
  });

  it("не выводит значение в тексте ошибки", () => {
    const leaked = "x".repeat(10);
    expect(() => parseServerEnv({ SESSION_SECRET: leaked })).toThrow(
      expect.objectContaining({ message: expect.not.stringContaining(leaked) }),
    );
  });
});

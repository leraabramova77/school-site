import { describe, expect, it, vi } from "vitest";
import { formatLogLine, logger, sanitizeLogFields } from "./logger.server";

describe("sanitizeLogFields", () => {
  it("пропускает белый список", () => {
    expect(
      sanitizeLogFields({
        method: "post",
        path: "/api/auth/login",
        status: 401,
        durationMs: 123.6,
        code: "login_failed",
      }),
    ).toEqual({
      method: "POST",
      path: "/api/auth/login",
      status: 401,
      durationMs: 124,
      code: "login_failed",
    });
  });

  it("отрезает query, hash и хост — там бывают токены", () => {
    expect(
      sanitizeLogFields({
        path: "/asp/Curriculum/Assignments.asp?AT=SECRET123#x",
      }),
    ).toEqual({
      path: "/asp/Curriculum/Assignments.asp",
    });
    expect(
      sanitizeLogFields({
        path: "https://user:pass@example.org/webapi/login?at=abc",
      }),
    ).toEqual({
      path: "/webapi/login",
    });
  });

  it("выбрасывает запрещённые поля целиком", () => {
    const out = sanitizeLogFields({
      cookie: "__Host-session=abc",
      authorization: "Bearer abc",
      at: "abc",
      body: { password: "p" },
      login: "ivanov",
      headers: { "set-cookie": "x" },
    });
    expect(out).toEqual({});
  });

  it("выбрасывает подозрительные значения разрешённых полей", () => {
    expect(
      sanitizeLogFields({
        method: "GET /x",
        status: 1e6,
        durationMs: -1,
        code: "a b; cookie=1",
      }),
    ).toEqual({});
  });
});

describe("formatLogLine", () => {
  it("от ошибки остаётся только имя класса", () => {
    const err = new TypeError("fetch failed: https://x/?AT=SECRET123");
    const line = formatLogLine(
      "error",
      "netschool_request",
      { status: 502 },
      err,
    );
    expect(JSON.parse(line)).toEqual({
      level: "error",
      event: "netschool_request",
      status: 502,
      errorName: "TypeError",
    });
    expect(line).not.toContain("SECRET123");
  });

  it("неожиданное имя события заменяется", () => {
    expect(JSON.parse(formatLogLine("info", "login ivanov")).event).toBe(
      "invalid_event",
    );
  });
});

describe("logger", () => {
  it("пишет одну JSON-строку без лишнего", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    logger.info("login_ok", {
      path: "/api/auth/login?x=1",
      ...({ password: "p" } as object),
    });
    expect(spy).toHaveBeenCalledWith(
      '{"level":"info","event":"login_ok","path":"/api/auth/login"}',
    );
    spy.mockRestore();
  });
});

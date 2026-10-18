import { describe, expect, it } from "vitest";
import {
  type SessionData,
  sealSession,
  sessionCookie,
  unsealSession,
} from "./session.server";

// Выдуманные значения; ключ — только для теста.
const secret = "test-secret-test-secret-test-secret-1234";
const data: SessionData = {
  ns: { cookies: { NSSESSIONID: "abc" }, at: "1234567890" },
  createdAt: 1,
  lastUsedAt: 2,
};

describe("cookie сессии", () => {
  it("шифруется: в cookie нет ни токена, ни cookie старого сайта", async () => {
    const seal = await sealSession(data, secret);
    expect(seal).not.toContain("1234567890");
    expect(seal).not.toContain("NSSESSIONID");
    expect(await unsealSession(seal, secret)).toEqual(data);
  });

  it("чужой ключ или подделка — null", async () => {
    const seal = await sealSession(data, secret);
    expect(await unsealSession(seal, `${secret}-other`)).toBeNull();
    expect(await unsealSession(`${seal.slice(0, -4)}AAAA`, secret)).toBeNull();
    expect(await unsealSession("мусор", secret)).toBeNull();
  });

  it("в проде — __Host-, Secure, httpOnly, SameSite=Lax, путь /", () => {
    expect(sessionCookie(true)).toEqual({
      name: "__Host-session",
      options: expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      }),
    });
    expect(sessionCookie(false).options.httpOnly).toBe(true);
  });
});

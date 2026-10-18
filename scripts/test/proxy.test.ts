import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { config, proxy } from "../../proxy";
import { PROTECTED_PATHS, sessionCookieName } from "../../src/shared/config";

function visit(path: string, withSession: boolean) {
  const headers = new Headers();
  if (withSession) headers.set("cookie", `${sessionCookieName()}=x`);
  const res = proxy(new NextRequest(`http://localhost${path}`, { headers }));
  return res.headers.get("location");
}

describe("proxy: редиректы входа", () => {
  it("без сессии разделы ведут на /login", () => {
    expect(visit("/today", false)).toBe("http://localhost/login");
    expect(visit("/diary/2026-10-12", false)).toBe("http://localhost/login");
  });

  it("с сессией /login ведёт на /today, разделы открываются", () => {
    expect(visit("/login", true)).toBe("http://localhost/today");
    expect(visit("/grades", true)).toBeNull();
  });

  it("без сессии /login открывается", () => {
    expect(visit("/login", false)).toBeNull();
  });

  it("matcher покрывает все закрытые разделы", () => {
    for (const path of PROTECTED_PATHS) {
      expect(config.matcher).toContain(`${path}/:path*`);
    }
  });
});

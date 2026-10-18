import { beforeEach, describe, expect, it, vi } from "vitest";

// Сеть и cookie подменяем: проверяем только поведение обработчиков.
const netschool = vi.hoisted(() => ({
  loginToNetschool: vi.fn(),
  logoutFromNetschool: vi.fn(),
}));
const session = vi.hoisted(() => ({
  readSession: vi.fn(),
  writeSession: vi.fn(),
  clearSession: vi.fn(),
}));

vi.mock("@/shared/netschool", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/netschool")>()),
  ...netschool,
}));
vi.mock("@/shared/session", () => session);

const { loginHandler, logoutHandler } = await import("./auth.server");
const { NetschoolError } = await import("@/shared/netschool");

// Выдуманные данные.
const fakeSession = {
  cookies: { NSSESSIONID: "secret-cookie" },
  at: "9876543210",
};
let ipCounter = 0;

function request(
  path: string,
  body: unknown,
  {
    origin = "http://localhost:5000",
    ip,
  }: { origin?: string | null; ip?: string } = {},
) {
  const headers: Record<string, string> = {
    host: "localhost:5000",
    "content-type": "application/json",
    "x-forwarded-for": ip ?? `10.0.0.${++ipCounter}`,
  };
  if (origin) headers.origin = origin;
  return new Request(`http://localhost:5000${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

const creds = { login: "ученик", password: "пароль" };

beforeEach(() => {
  vi.clearAllMocks();
  netschool.loginToNetschool.mockResolvedValue({ session: fakeSession });
});

describe("POST /api/auth/login", () => {
  it("успех: сессия записана, в ответе нет токена и cookie старого сайта", async () => {
    const res = await loginHandler(request("/api/auth/login", creds));
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(JSON.parse(text)).toEqual({ ok: true });
    expect(text).not.toContain(fakeSession.at);
    expect(text).not.toContain("secret-cookie");
    expect(text).not.toContain(creds.password);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(session.writeSession).toHaveBeenCalledWith(
      expect.objectContaining({ ns: fakeSession }),
    );
  });

  it("чужой Origin или без Origin — 403, в netschool не ходим", async () => {
    const evil = await loginHandler(
      request("/api/auth/login", creds, { origin: "https://evil.example" }),
    );
    const none = await loginHandler(
      request("/api/auth/login", creds, { origin: null }),
    );
    expect(evil.status).toBe(403);
    expect(none.status).toBe(403);
    expect(netschool.loginToNetschool).not.toHaveBeenCalled();
  });

  it("пустой логин — 400", async () => {
    const res = await loginHandler(
      request("/api/auth/login", { login: " ", password: "x" }),
    );
    expect(res.status).toBe(400);
  });

  it("неверный пароль — 401 с понятным текстом", async () => {
    netschool.loginToNetschool.mockRejectedValue(
      new NetschoolError("bad_credentials"),
    );
    const res = await loginHandler(request("/api/auth/login", creds));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      ok: false,
      error: "Неверный логин или пароль",
    });
    expect(session.writeSession).not.toHaveBeenCalled();
  });

  it("6-я попытка с одного IP за 10 минут — 429 с Retry-After", async () => {
    const ip = "192.0.2.77";
    for (let i = 0; i < 5; i++) {
      const res = await loginHandler(request("/api/auth/login", creds, { ip }));
      expect(res.status).toBe(200);
    }
    const sixth = await loginHandler(request("/api/auth/login", creds, { ip }));
    expect(sixth.status).toBe(429);
    expect(Number(sixth.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(netschool.loginToNetschool).toHaveBeenCalledTimes(5);
  });
});

describe("POST /api/auth/logout", () => {
  it("выходит на старом сайте и удаляет cookie", async () => {
    session.readSession.mockResolvedValue({
      ns: fakeSession,
      createdAt: 0,
      lastUsedAt: 0,
    });
    const res = await logoutHandler(request("/api/auth/logout", {}));
    expect(res.status).toBe(200);
    expect(netschool.logoutFromNetschool).toHaveBeenCalledWith(fakeSession);
    expect(session.clearSession).toHaveBeenCalled();
  });

  it("без сессии — просто удаляет cookie", async () => {
    session.readSession.mockResolvedValue(null);
    const res = await logoutHandler(request("/api/auth/logout", {}));
    expect(res.status).toBe(200);
    expect(netschool.logoutFromNetschool).not.toHaveBeenCalled();
    expect(session.clearSession).toHaveBeenCalled();
  });

  it("чужой Origin — 403, cookie не трогаем", async () => {
    const res = await logoutHandler(
      request("/api/auth/logout", {}, { origin: "https://evil.example" }),
    );
    expect(res.status).toBe(403);
    expect(session.clearSession).not.toHaveBeenCalled();
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, getApi } from "./api-client";

function mockFetch(impl: () => Promise<Response>) {
  vi.stubGlobal("fetch", vi.fn(impl));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getApi", () => {
  it("возвращает data из успешного ответа", async () => {
    mockFetch(async () => Response.json({ ok: true, data: { a: 1 } }));
    await expect(getApi("/api/x")).resolves.toEqual({ a: 1 });
  });

  it("401 needLogin → ApiError с флагом входа", async () => {
    mockFetch(async () =>
      Response.json(
        { ok: false, error: "Нужно войти", needLogin: true },
        { status: 401 },
      ),
    );
    const error = await getApi("/api/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      message: "Нужно войти",
      status: 401,
      needLogin: true,
    });
  });

  it("не JSON → общий текст ошибки", async () => {
    mockFetch(async () => new Response("<html>", { status: 502 }));
    await expect(getApi("/api/x")).rejects.toMatchObject({
      status: 502,
      needLogin: false,
    });
  });

  it("сеть упала → понятный текст про интернет", async () => {
    mockFetch(async () => {
      throw new TypeError("Failed to fetch");
    });
    await expect(getApi("/api/x")).rejects.toMatchObject({
      status: 0,
      message: expect.stringContaining("интернет"),
    });
  });
});

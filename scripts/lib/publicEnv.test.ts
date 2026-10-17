import { describe, expect, it } from "vitest";
import { findSecretPublicEnv } from "./publicEnv";

describe("findSecretPublicEnv", () => {
  it("находит секретные слова в именах NEXT_PUBLIC_*", () => {
    const text =
      "NEXT_PUBLIC_SESSION_SECRET=x\nNEXT_PUBLIC_API_KEY=y\nprocess.env.NEXT_PUBLIC_AUTH_TOKEN";
    expect(findSecretPublicEnv(text).sort()).toEqual([
      "NEXT_PUBLIC_API_KEY",
      "NEXT_PUBLIC_AUTH_TOKEN",
      "NEXT_PUBLIC_SESSION_SECRET",
    ]);
  });

  it("пропускает безопасные публичные переменные и серверные секреты", () => {
    const text = "NEXT_PUBLIC_SITE_URL=https://x\nSESSION_SECRET=z";
    expect(findSecretPublicEnv(text)).toEqual([]);
  });
});

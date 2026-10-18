import { describe, expect, it } from "vitest";
import { NetschoolError } from "./errors";
import { parseAt, parseAutoForm, parseLoginForm } from "./login.server";

// Выдуманные фрагменты страниц netschool.
const loginPage = `
<script>var x = { salt: '123456789', other: 1 };</script>
<form><input type="hidden" name="LT" value="777"><input type="hidden" name="VER" value="888"></form>`;

const postlogin = `
<form action="/asp/Announce/ViewAnnouncements.asp" method="post">
  <input type="hidden" name="AT" value="1234567890123">
  <input type="hidden" name="VER" value="999">
</form><script>document.forms[0].submit()</script>`;

describe("parseLoginForm", () => {
  it("достаёт соль, LT и VER", () => {
    expect(parseLoginForm(loginPage)).toEqual({
      salt: "123456789",
      lt: "777",
      ver: "888",
    });
  });

  it("без соли — unexpected_response", () => {
    expect(() => parseLoginForm("<html></html>")).toThrow(NetschoolError);
  });
});

describe("parseAt", () => {
  it("берёт AT из автоформы", () => {
    expect(parseAt(postlogin)).toBe("1234567890123");
  });

  it("страница с ошибкой входа — нет AT", () => {
    expect(parseAt("<p>Неверный пароль</p>")).toBeUndefined();
  });
});

describe("parseAutoForm", () => {
  it("возвращает action и скрытые поля", () => {
    expect(parseAutoForm(postlogin)).toEqual({
      action: "/asp/Announce/ViewAnnouncements.asp",
      fields: { AT: "1234567890123", VER: "999" },
    });
  });

  it("не идёт на чужой хост", () => {
    expect(
      parseAutoForm('<form action="https://evil.example/x"></form>'),
    ).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";
import { hashPassword, toSiteBytes } from "./password.server";

// Эталоны посчитаны независимо: .NET Encoding(1251) + MD5. Пароли и соль выдуманные.
describe("hashPassword", () => {
  it("латиница", () => {
    expect(hashPassword("abc", "1234567890")).toEqual({
      PW2: "d1270348d92823aa64833a2d7bb027ca",
      PW: "d12",
    });
  });

  it("кириллица, Ё/ё и № — как в windows-1251", () => {
    expect(hashPassword("Пароль№1ёЁ", "1234567890")).toEqual({
      PW2: "62ff6bd13803e719e3f85adb9f6c2695",
      PW: "62ff6bd138",
    });
  });

  it("символы вне таблицы дают 0, длина — в UTF-16 единицах, как в JS сайта", () => {
    // «😀» — две UTF-16 единицы, «€» — одна: всего 7 символов для обрезки PW.
    expect(hashPassword("pass😀€", "42")).toEqual({
      PW2: "15fd918e6b9742689d01afed3ae782e1",
      PW: "15fd918",
    });
  });
});

describe("toSiteBytes", () => {
  it("совпадает с windows-1251 на русском алфавите", () => {
    expect([...toSiteBytes("АаЯяЁё№")]).toEqual([
      0xc0, 0xe0, 0xdf, 0xff, 0xa8, 0xb8, 0xb9,
    ]);
  });

  it("неизвестное → 0, а не «?»", () => {
    expect([...toSiteBytes("«€»")]).toEqual([0xab, 0, 0xbb]);
  });
});

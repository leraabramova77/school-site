import { describe, expect, it } from "vitest";
import { htmlToText, sanitizeHtml } from "./sanitize";

describe("sanitizeHtml", () => {
  it("вырезает <script>, обработчики событий и javascript:", () => {
    const out = sanitizeHtml(
      '<p onclick="steal()">Текст<script>alert(1)</script></p>' +
        '<img src=x onerror="alert(1)">' +
        '<a href="javascript:alert(1)">клик</a>' +
        "<style>body{display:none}</style><iframe src='https://evil.example'></iframe>",
    );
    expect(out).toBe("<p>Текст</p><span>клик</span>");
    expect(out).not.toMatch(
      /script|onerror|onclick|javascript|iframe|style|img/i,
    );
  });

  it("оставляет разметку текста и внешние ссылки — в новой вкладке, без передачи окна", () => {
    expect(
      sanitizeHtml(
        '<b>Важно</b>: <a href="https://example.org/task">задание</a>',
      ),
    ).toBe(
      '<b>Важно</b>: <a href="https://example.org/task" target="_blank" rel="noopener noreferrer nofollow">задание</a>',
    );
  });

  it("относительные ссылки старого сайта превращает в текст", () => {
    expect(sanitizeHtml('<a href="/asp/attachment.asp?id=1">файл</a>')).toBe(
      "<span>файл</span>",
    );
  });
});

describe("htmlToText", () => {
  it("только текст", () => {
    expect(htmlToText("<p>Раз&nbsp;<b>два</b></p><script>x</script>")).toBe(
      "Раз два",
    );
  });
});

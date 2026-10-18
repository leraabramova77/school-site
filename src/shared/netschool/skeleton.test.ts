import { describe, expect, it } from "vitest";
import { htmlSkeleton, maskText } from "./skeleton";

describe("htmlSkeleton", () => {
  it("маскирует текст и значения, оставляет структуру", () => {
    const out = htmlSkeleton(
      '<table class="t"><tr bgcolor="#fff"><td title="Иванов">Оценка 5</td></tr></table>' +
        '<input type="hidden" name="AT" value="1234567"><script>var at="1234567"</script>',
    );
    expect(out).toContain('<table class="t">');
    expect(out).toContain("xxxxxx 9");
    expect(out).toContain('name="AT"');
    expect(out).not.toContain("1234567");
    expect(out).not.toContain("Иванов");
  });

  it("maskText: цифры → 9, буквы → x", () => {
    expect(maskText("12.10.26, Пн")).toBe("99.99.99, xx");
  });
});

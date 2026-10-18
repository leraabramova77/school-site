import { describe, expect, it } from "vitest";
import { parseDiary, parseSiteDate, toSiteDate } from "./diary";

// Выдуманная неделя в разметке, как у Assignments.asp (docs/api-map.md §3). Ни одного реального значения.
const html = `
<form>
  <select name="DATE">
    <option value="5.10.26">5.10.26 - 10.10.26</option>
    <option value="12.10.26" selected>12.10.26 - 17.10.26</option>
  </select>
  <input type="hidden" name="PCLID_IUP" value="111_0">
</form>
<table class="table table-bordered table-thin table-xs">
  <tr><th>День</th><th>Предмет</th><th>Тип</th><th>Тема</th><th>Вес</th><th>Отметка</th></tr>
  <tr bgcolor="#FFFFFF">
    <td class="hidden-scr-sm" rowspan="2">12.10.26, Пн</td>
    <td>Алгебра</td><td>Д</td>
    <td><a href="javascript:SubmAssign(1001,2002,3)">Квадратные   уравнения</a></td>
    <td>1</td><td>5</td>
  </tr>
  <tr class="visible-scr-row-sm"><td colspan="5">12.10.26, Пн</td></tr>
  <tr bgcolor="#EEEEEE">
    <td>Русский язык</td><td>К</td><td>Диктант</td><td>2,5</td><td>-</td>
  </tr>
  <tr bgcolor="#FFFFFF">
    <td class="hidden-scr-sm">13.10.26, Вт</td>
    <td>Физика</td><td>_П</td><td>Опыт</td><td></td><td>.</td>
  </tr>
</table>`;

describe("parseDiary", () => {
  const week = parseDiary(html);

  it("разбирает строки заданий и переносит дату из rowspan", () => {
    expect(week.items).toHaveLength(3);
    expect(week.items[0]).toEqual({
      date: "2026-10-12",
      subject: "Алгебра",
      typeCode: "Д",
      theme: "Квадратные уравнения",
      weight: 1,
      mark: 5,
      markRaw: null,
      assignment: { aid: "1001", cid: "2002", tp: "3" },
    });
    expect(week.items[1]).toMatchObject({
      date: "2026-10-12",
      weight: 2.5,
      mark: null,
      markRaw: null,
    });
    expect(week.items[2]).toMatchObject({
      date: "2026-10-13",
      weight: null,
      mark: null,
      markRaw: ".",
    });
  });

  it("берёт список недель, выбранную неделю и PCLID_IUP", () => {
    expect(week.weeks).toEqual(["2026-10-05", "2026-10-12"]);
    expect(week.selectedWeek).toBe("2026-10-12");
    expect(week.pclid).toBe("111_0");
  });

  it("пустая страница — пустая неделя, без исключения", () => {
    expect(parseDiary("<html></html>")).toEqual({
      items: [],
      weeks: [],
      selectedWeek: null,
      pclid: null,
    });
  });
});

describe("даты сайта", () => {
  it("d.MM.yy ↔ ISO", () => {
    expect(parseSiteDate("7.09.26, Пн")).toBe("2026-09-07");
    expect(toSiteDate("2026-10-12")).toBe("12.10.26");
    expect(parseSiteDate("нет даты")).toBeNull();
  });
});

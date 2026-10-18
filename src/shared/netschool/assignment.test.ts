import { describe, expect, it } from "vitest";
import { parseAssignmentInfo } from "./assignment";
import { NetschoolError } from "./errors";

// Выдуманный ответ в формате GetAssignmentInfo.asp.
const response = JSON.stringify({
  data: {
    strTitle: "Информация о задании: Алгебра",
    strTable:
      "<table><tr><th>Домашнее задание:</th><td>№ 12, 13</td></tr>" +
      "<tr><th>Подробности от учителя</th><td><b>Повторить</b> формулы</td></tr>" +
      "<tr><td colspan='2'>без заголовка</td></tr></table>",
  },
  message: null,
  errorCode: 0,
  isError: false,
});

describe("parseAssignmentInfo", () => {
  it("строки «заголовок → HTML», заголовок задания без префикса", () => {
    expect(parseAssignmentInfo(response)).toEqual({
      title: "Алгебра",
      rows: [
        { label: "Домашнее задание", rawHtml: "№ 12, 13" },
        {
          label: "Подробности от учителя",
          rawHtml: "<b>Повторить</b> формулы",
        },
      ],
    });
  });

  it("не JSON или isError — unexpected_response", () => {
    expect(() => parseAssignmentInfo("<html>")).toThrow(NetschoolError);
    expect(() =>
      parseAssignmentInfo(
        JSON.stringify({ data: { strTable: "" }, isError: true }),
      ),
    ).toThrow(NetschoolError);
  });
});

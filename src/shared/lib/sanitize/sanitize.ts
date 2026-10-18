import sanitize from "sanitize-html";

/*
 * Очистка HTML от учителей и из объявлений перед показом (ТЗ-1 §4.4, «XSS»). Белый список: только разметка текста
 * и ссылки на внешние сайты. Скрипты, стили, обработчики событий, картинки, iframe и формы — вырезаются.
 * Относительные ссылки (вложения старого сайта) тоже: без его сессии они не откроются, а с ней — утечёт токен.
 */

const ALLOWED_TAGS = [
  "p",
  "br",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "a",
  "span",
  "div",
];

export function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["https", "http", "mailto"],
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    transformTags: {
      a: (tagName, attribs): sanitize.Tag => {
        const href = attribs.href ?? "";
        if (!/^(https?:|mailto:)/i.test(href)) {
          // Ссылка «в никуда» — оставляем только текст.
          return { tagName: "span", attribs: {} };
        }
        return {
          tagName,
          attribs: {
            href,
            target: "_blank",
            rel: "noopener noreferrer nofollow",
          },
        };
      },
    },
  }).trim();
}

/** Только текст без разметки — для превью и подписей. */
export function htmlToText(html: string): string {
  return sanitize(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

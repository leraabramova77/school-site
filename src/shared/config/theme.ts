// Цвет панели браузера и статус-бара (meta theme-color) — равен токену --bg каждой темы.
// Совпадение с globals.css проверяет src/app/styles/tokens.test.ts.
export const themeColor = {
  light: "#f2f3f8",
  dark: "#0d0e13",
} as const;

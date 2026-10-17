// Цвет панели браузера и статус-бара (meta theme-color) — равен токену --bg каждой темы.
// Совпадение с globals.css проверяет src/app/styles/tokens.test.ts.
export const themeColor = {
  light: "#f9fafb",
  dark: "#101215",
} as const;

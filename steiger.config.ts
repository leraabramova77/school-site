import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Пока сущности и виджеты использует только витрина /design. Вернуть правило, когда появятся экраны «Дневник»,
    // «Сегодня» и «Оценки» (задачи 0015–0017, см. docs/PRD.md).
    files: ["./src/entities/**", "./src/widgets/**"],
    rules: { "fsd/insignificant-slice": "off" },
  },
]);

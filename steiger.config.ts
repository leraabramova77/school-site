import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Пока сущности и виджеты использует только витрина /design. Вернуть правило, когда появятся экраны «Дневник»,
    // «Сегодня» и «Оценки» (задачи 0018–0020, см. docs/PRD.md).
    files: ["./src/entities/**", "./src/widgets/**"],
    rules: { "fsd/insignificant-slice": "off" },
  },
  {
    // Steiger не видит корневой `app/` (роутинг Next), а API входа сейчас используют только маршруты оттуда.
    // Вернуть правило, когда экран входа (задача 0016) возьмёт форму из этого слайса.
    files: ["./src/features/auth/**"],
    rules: { "fsd/insignificant-slice": "off" },
  },
]);

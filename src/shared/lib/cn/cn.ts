import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
 * tailwind-merge не знает наших токенов: без подсказки `text-footnote` (размер) он сочтёт цветом и выкинет
 * при слиянии с `text-accent`. Список размеров и скруглений — из @theme в src/app/styles/globals.css.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "footnote",
        "subhead",
        "body",
        "title-3",
        "title-1",
        "large-title",
      ],
      radius: ["card"],
    },
  },
});

/** Склеивает классы, более поздние Tailwind-классы перебивают ранние (`cn("p-2", "p-4")` → `p-4`). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

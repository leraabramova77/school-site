import type { Metadata, Viewport } from "next";
import {
  Caveat,
  Golos_Text,
  Manrope,
  Onest,
  Unbounded,
} from "next/font/google";
import { MotionProvider } from "@/app/motion";
import { QueryProvider } from "@/app/query";
import { ThemeProvider } from "@/app/theme";
import { DesignSync } from "@/features/design-switch";
import { themeColor } from "@/shared/config";
import "@/app/styles/globals.css";
import "@/app/styles/design-variants.css";

// Manrope — основной текст, Unbounded — крупные цифры и заголовки (вариант дизайна B).
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});
const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
});
// Шрифты вариантов A (Onest + «почерк» Caveat) и C (Golos Text): грузятся, только когда вариант выбран.
const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
  preload: false,
});
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700"],
  preload: false,
});
const golos = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "cyrillic"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Дневник",
  description: "Неофициальный мобильный клиент школьного дневника",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: themeColor.dark },
  ],
};

const fonts = [manrope, unbounded, onest, caveat, golos]
  .map((font) => font.variable)
  .join(" ");

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // next-themes ставит класс темы на <html> до гидрации — отсюда suppressHydrationWarning.
    <html
      lang="ru"
      className={`${fonts} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider>
          <DesignSync />
          <QueryProvider>
            <MotionProvider>{children}</MotionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

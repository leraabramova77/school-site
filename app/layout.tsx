import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { MotionProvider } from "@/app/motion";
import { QueryProvider } from "@/app/query";
import { ThemeProvider } from "@/app/theme";
import { themeColor } from "@/shared/config";
import "@/app/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // next-themes ставит класс темы на <html> до гидрации — отсюда suppressHydrationWarning.
    <html
      lang="ru"
      className={`${geistSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider>
          <QueryProvider>
            <MotionProvider>{children}</MotionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

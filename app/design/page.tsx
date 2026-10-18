import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Дизайн-система",
  robots: { index: false, follow: false },
};

export { DesignPage as default } from "@/pages/design";

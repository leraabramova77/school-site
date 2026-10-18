import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProbePage } from "@/pages/netschool-probe";

export const metadata: Metadata = {
  title: "Проверка netschool",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ProbePage />;
}

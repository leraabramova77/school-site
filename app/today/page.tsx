import type { Metadata } from "next";
import { ComingSoonPage } from "@/pages/coming-soon";

export const metadata: Metadata = { title: "Сегодня" };

export default function Page() {
  return <ComingSoonPage title="Сегодня" />;
}

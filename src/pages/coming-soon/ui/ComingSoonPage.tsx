import { Construction } from "lucide-react";
import { EmptyState } from "@/shared/ui";
import { Screen } from "@/widgets/app-shell";

/** Раздел, который ещё делается: каркас приложения с заголовком и заглушкой. */
export function ComingSoonPage({ title }: { title: string }) {
  return (
    <Screen title={title}>
      <EmptyState
        icon={<Construction aria-hidden />}
        title="Скоро здесь всё появится"
        description="Раздел в разработке."
      />
    </Screen>
  );
}

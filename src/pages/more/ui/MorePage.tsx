import { LogoutButton } from "@/features/auth";
import { Screen } from "@/widgets/app-shell";

/** «Ещё»: пока только выход; профиль, тема и «О безопасности» — в задаче 0022. */
export function MorePage() {
  return (
    <Screen title="Ещё">
      <LogoutButton />
    </Screen>
  );
}

"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LOGIN_PATH } from "@/shared/config";
import { Button } from "@/shared/ui";

/** Выход: netschool + удаление нашей cookie. Даже если сеть упала — уводим на экран входа. */
export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace(LOGIN_PATH);
    router.refresh();
  }

  return (
    <Button
      variant="destructive"
      onClick={logout}
      disabled={pending}
      className="w-full"
    >
      {pending ? (
        <LoaderCircle className="animate-spin" aria-hidden />
      ) : (
        <LogOut aria-hidden />
      )}
      Выйти
    </Button>
  );
}

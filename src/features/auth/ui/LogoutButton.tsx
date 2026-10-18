"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { useState } from "react";
import { LOGIN_PATH } from "@/shared/config";
import { Button } from "@/shared/ui";

/** Выход: netschool + удаление нашей cookie. Даже если сеть упала — уводим на экран входа. */
export function LogoutButton() {
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    // Полная перезагрузка, а не переход в SPA: заодно стираются данные дневника из памяти вкладки.
    window.location.replace(LOGIN_PATH);
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

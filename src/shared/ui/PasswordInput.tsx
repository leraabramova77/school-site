"use client";

import { Eye, EyeOff } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Input } from "./Input";

type PasswordInputProps = Omit<ComponentProps<"input">, "type">;

/** Поле пароля с кнопкой «показать». Пароль никуда не сохраняется — только уходит в форму. */
export function PasswordInput({
  className,
  autoComplete = "current-password",
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className={cn("pr-12", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
        aria-pressed={visible}
        disabled={props.disabled}
        className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-xl text-text-muted hover:text-text disabled:pointer-events-none [&_svg]:size-5"
      >
        {visible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
      </button>
    </div>
  );
}

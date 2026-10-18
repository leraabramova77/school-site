import { BookOpen, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/features/auth";

/** Экран входа. Мобильный в первую очередь: одна колонка по центру, отступы под вырез и полоску iPhone. */
export function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-4 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <header className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-16 items-center justify-center rounded-[1.25rem] bg-accent text-accent-fg shadow-sm">
          <BookOpen className="size-8" aria-hidden />
        </div>
        <h1 className="font-semibold text-large-title tracking-tight">
          Дневник
        </h1>
        <p className="text-body text-text-muted">
          Войди с логином и паролем от netschool
        </p>
      </header>

      <LoginForm />

      <p className="flex items-start justify-center gap-2 text-center text-footnote text-text-muted">
        <ShieldCheck className="mt-px size-4 shrink-0" aria-hidden />
        <span>
          Пароль не сохраняется — он нужен только для входа на сайт школы.
          Неофициальное приложение.
        </span>
      </p>
    </main>
  );
}

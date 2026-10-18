export function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-3 px-4 pt-[max(4rem,env(safe-area-inset-top))] pb-[max(4rem,env(safe-area-inset-bottom))]">
      <h1 className="font-semibold text-large-title tracking-tight">Дневник</h1>
      <p className="text-body text-text-muted">
        Неофициальный мобильный клиент школьного дневника. Сейчас в разработке.
      </p>
    </main>
  );
}

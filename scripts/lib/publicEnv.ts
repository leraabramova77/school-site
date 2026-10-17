// Переменные NEXT_PUBLIC_* попадают в JS браузера, поэтому секреты в них класть нельзя (ТЗ-1 §4.3).
const SECRET_WORDS = ["SECRET", "KEY", "TOKEN", "PASSWORD", "PEPPER"];
const PUBLIC_ENV_RE = /NEXT_PUBLIC_[A-Z0-9_]+/g;

export function findSecretPublicEnv(text: string): string[] {
  const names = new Set(text.match(PUBLIC_ENV_RE) ?? []);
  return [...names].filter((name) =>
    SECRET_WORDS.some((word) => name.includes(word)),
  );
}

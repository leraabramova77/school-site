import { cn } from "@/shared/lib/cn";

type SafeHtmlProps = {
  /** HTML, уже очищенный `sanitizeHtml` на сервере. Сырой HTML от netschool сюда не передавать. */
  sanitizedHtml: string;
  className?: string;
};

/** Единственное место, где вставляется HTML (ТЗ-1 §4.6): тексты учителя после санитайзера. */
export function SafeHtml({ sanitizedHtml, className }: SafeHtmlProps) {
  return (
    <div
      data-slot="safe-html"
      className={cn(
        "[overflow-wrap:anywhere] [&_a]:text-accent [&_a]:underline [&_li]:ms-5 [&_ol]:list-decimal [&_p+p]:mt-2 [&_ul]:list-disc",
        className,
      )}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML уже прошёл allowlist-санитайзер на сервере.
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

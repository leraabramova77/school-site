import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

/** Все размеры не ниже 44 px — минимальная зона нажатия (ТЗ-1 §5.4). */
export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-[background-color,opacity,transform] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg hover:bg-accent/90",
        secondary: "bg-surface-2 text-text hover:bg-border",
        outline: "border border-border bg-surface text-text hover:bg-surface-2",
        ghost: "text-text hover:bg-surface-2",
        destructive: "bg-grade-2 text-accent-fg hover:bg-grade-2/90",
      },
      size: {
        md: "h-11 px-4 text-body",
        sm: "h-11 px-3 text-subhead",
        lg: "h-12 px-6 text-body",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Отдать стили дочернему элементу (например, ссылке `<Link>`), не оборачивая его в <button>. */
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

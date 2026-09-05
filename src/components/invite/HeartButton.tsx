import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type HeartButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "yes" | "no" | "soft";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  full?: boolean;
};

const variants: Record<NonNullable<HeartButtonProps["variant"]>, string> = {
  yes: "bg-gradient-primary text-primary-foreground shadow-soft",
  no: "bg-secondary text-secondary-foreground border border-border",
  soft: "bg-card text-foreground border border-border",
};

/** Large, touch-friendly playful button used across the invitation flow. */
export function HeartButton({
  children,
  onClick,
  variant = "yes",
  type = "button",
  disabled,
  className,
  full = true,
}: HeartButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-12 touch-manipulation items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold tracking-wide transition-transform active:scale-[0.98] disabled:opacity-50 sm:min-h-14 sm:px-6 sm:text-base",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        full && "w-full",
        disabled && "cursor-not-allowed opacity-60",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

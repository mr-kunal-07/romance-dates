import { motion } from "motion/react";
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
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={cn(
        "inline-flex min-h-14 items-center justify-center rounded-lg px-6 text-base font-semibold tracking-wide transition-opacity",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        full && "w-full",
        disabled && "cursor-not-allowed opacity-60",
        variants[variant],
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

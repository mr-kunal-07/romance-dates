import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

export type ModalProps = {
  open: boolean;
  /** Stable key so switching steps animates as a swap, not a re-render. */
  stepKey: string;
  title?: ReactNode;
  children: ReactNode;
};

/** Reusable, non-dismissable romantic modal card with smooth step transitions. */
export function Modal({ open, stepKey, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-foreground/25 backdrop-blur-sm" />
          <AnimatePresence mode="wait">
            <motion.div
              key={stepKey}
              className="card-glass relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-lg p-6 sm:p-8"
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              {title ? (
                <h2 className="text-balance-pretty text-center text-2xl leading-snug font-semibold text-foreground sm:text-3xl">
                  {title}
                </h2>
              ) : null}
              <div className={title ? "mt-6" : undefined}>{children}</div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

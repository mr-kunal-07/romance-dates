import { useEffect, useId, useRef, type ReactNode } from "react";

export type ModalProps = {
  open: boolean;
  /** Stable key so switching steps animates as a swap, not a re-render. */
  stepKey: string;
  title?: ReactNode;
  children: ReactNode;
};

/** Reusable, non-dismissable romantic modal card with smooth step transitions. */
export function Modal({ open, stepKey, title, children }: ModalProps) {
  const titleId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cardRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);
  if (!open) return null;
  return (
    <div
      className="invite-modal fixed inset-0 z-50 flex items-center justify-center bg-foreground/25"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : "Your date confirmation"}
    >
      <div
        key={stepKey}
        ref={cardRef}
        tabIndex={-1}
        className="invite-modal-card card-glass animate-card-in relative min-w-0 w-full max-w-md overflow-y-auto overscroll-contain rounded-lg p-4 outline-none sm:p-6"
      >
        {title && (
          <h2
            id={titleId}
            className="text-balance-pretty text-center text-[1.375rem] leading-snug font-semibold text-foreground sm:text-3xl"
          >
            {title}
          </h2>
        )}
        <div className={title ? "mt-4 sm:mt-5" : undefined}>{children}</div>
      </div>
    </div>
  );
}

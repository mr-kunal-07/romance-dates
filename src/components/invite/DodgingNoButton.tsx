import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Position = { left: number; top: number; width: number };
const margin = 16;

function screenBounds() {
  const viewport = window.visualViewport;
  const width = viewport?.width ?? window.innerWidth;
  const height = viewport?.height ?? window.innerHeight;
  const buttonWidth = Math.min(180, width - margin * 2);
  return {
    minLeft: (viewport?.offsetLeft ?? 0) + margin,
    minTop: (viewport?.offsetTop ?? 0) + margin,
    maxLeft: (viewport?.offsetLeft ?? 0) + width - buttonWidth - margin,
    maxTop: (viewport?.offsetTop ?? 0) + height - 56 - margin,
    width: buttonWidth,
  };
}

export function DodgingNoButton({ children }: { children: ReactNode }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [portalHost, setPortalHost] = useState<Element | null>(null);

  useEffect(() => {
    const keepOnScreen = () => {
      const bounds = screenBounds();
      setPosition(
        (previous) =>
          previous && {
            left: Math.max(bounds.minLeft, Math.min(previous.left, bounds.maxLeft)),
            top: Math.max(bounds.minTop, Math.min(previous.top, bounds.maxTop)),
            width: bounds.width,
          },
      );
    };
    window.addEventListener("resize", keepOnScreen);
    window.visualViewport?.addEventListener("resize", keepOnScreen);
    return () => {
      window.removeEventListener("resize", keepOnScreen);
      window.visualViewport?.removeEventListener("resize", keepOnScreen);
    };
  }, []);

  function dodge() {
    // Unsupported browsers simply skip haptics; moving the button still works.
    try {
      navigator.vibrate?.([80, 40, 80]);
    } catch {
      /* Haptics may be disabled by the browser. */
    }
    const current = buttonRef.current?.getBoundingClientRect();
    const dialog = buttonRef.current?.closest('[role="dialog"]');
    if (!current || !dialog) return;
    const yes = dialog.querySelector("[data-invite-yes]")?.getBoundingClientRect();
    const bounds = screenBounds();
    let next: Position = { left: bounds.minLeft, top: bounds.minTop, width: bounds.width };
    // Prefer a clearly different location and leave the Yes button accessible.
    for (let attempt = 0; attempt < 40; attempt++) {
      const candidate = {
        left: bounds.minLeft + Math.random() * Math.max(0, bounds.maxLeft - bounds.minLeft),
        top: bounds.minTop + Math.random() * Math.max(0, bounds.maxTop - bounds.minTop),
        width: bounds.width,
      };
      const overlapsYes =
        yes &&
        candidate.left < yes.right + 8 &&
        candidate.left + candidate.width > yes.left - 8 &&
        candidate.top < yes.bottom + 8 &&
        candidate.top + 56 > yes.top - 8;
      if (!overlapsYes) {
        next = candidate;
        if (Math.hypot(candidate.left - current.left, candidate.top - current.top) > 100) break;
      }
    }
    setPortalHost(dialog);
    setPosition(next);
  }

  const button = (
    <button
      ref={buttonRef}
      type="button"
      onClick={dodge}
      className="pointer-events-auto inline-flex h-14 items-center justify-center rounded-lg border border-border bg-secondary px-6 text-base font-semibold text-secondary-foreground shadow-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      style={position ? { position: "fixed", zIndex: 60, ...position } : { width: "100%" }}
    >
      {children}
    </button>
  );

  return position && portalHost ? (
    <>
      <div className="h-14" aria-hidden />
      {createPortal(button, portalHost)}
    </>
  ) : (
    button
  );
}

import { useMemo, type CSSProperties } from "react";

type Heart = {
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
};

/** Decorative floating hearts layer. Purely visual, never interactive. */
export function FloatingHearts({ count = 8 }: { count?: number }) {
  const hearts = useMemo<Heart[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 97) % 100,
        size: 12 + ((i * 13) % 22),
        duration: 12 + ((i * 7) % 12),
        delay: (i * 1.7) % 14,
        opacity: 0.25 + ((i * 11) % 40) / 100,
      })),
    [count],
  );

  return (
    <div aria-hidden className="floating-hearts pointer-events-none fixed inset-0 overflow-hidden">
      {hearts.map((heart, i) => (
        <span
          key={i}
          className="animate-float-up absolute bottom-[-10vh] text-primary"
          style={{
            left: `${heart.left}%`,
            fontSize: `${heart.size}px`,
            animationDuration: `${heart.duration}s`,
            animationDelay: `${heart.delay}s`,
            opacity: heart.opacity,
          }}
        >
          ♥
        </span>
      ))}
      {[-70, 0, 70].map((drift, i) => (
        <span
          key={`center-${drift}`}
          className="center-heart absolute bottom-0 left-1/2 text-lg text-primary/50"
          style={{ "--heart-drift": `${drift}px`, animationDelay: `${i * 2.5}s` } as CSSProperties}
        >
          ♥
        </span>
      ))}
    </div>
  );
}

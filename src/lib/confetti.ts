/** Subtle romantic confetti burst, loaded lazily so it never ships to SSR. */
export async function celebrate() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const confetti = (await import("canvas-confetti")).default;
  const colors = ["#f472b6", "#fb7185", "#c084fc", "#fda4af", "#fecdd3"];
  confetti({
    particleCount: window.innerWidth < 640 ? 35 : 70,
    spread: 70,
    origin: { y: 0.7 },
    colors,
    scalar: 0.9,
    disableForReducedMotion: true,
  });
}

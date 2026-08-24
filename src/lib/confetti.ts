/** Subtle romantic confetti burst, loaded lazily so it never ships to SSR. */
export async function celebrate() {
  const confetti = (await import("canvas-confetti")).default;
  const colors = ["#f472b6", "#fb7185", "#c084fc", "#fda4af", "#fecdd3"];
  confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 }, colors, scalar: 0.9 });
  setTimeout(
    () => confetti({ particleCount: 40, spread: 100, origin: { y: 0.6 }, colors, scalar: 0.8 }),
    250,
  );
}

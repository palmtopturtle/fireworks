import { randomRange, TWOPI } from "./utils.js";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export const PATTERNS = {
  ring: count =>
    Array.from({ length: count }, (_, i) => ({ angle: (TWOPI * i) / count, speedScale: 1 })),
  scatter: count =>
    Array.from({ length: count }, () => ({ angle: randomRange(0, TWOPI), speedScale: randomRange(0.3, 1) })),
  sphere: count => {
    const spin = randomRange(0, TWOPI); // Each explosion looks different
    return Array.from({ length: count }, (_, i) => {
      const z = 1 - (2 * (i + 0.5)) / count; // Depth from front (+1) to back (-1)
      const r = Math.sqrt(1 - z * z); // How much of the motion is visible on screen
      return { angle: i * GOLDEN_ANGLE + spin, speedScale: r, depth: z };
    });
  },
}
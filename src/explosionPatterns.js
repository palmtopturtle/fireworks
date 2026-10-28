import { TWOPI } from "./constants.js";
import { randomRange } from "./utils.js";

export const PATTERNS = {
  ring: count =>
    Array.from({ length: count }, (_, i) => ({ angle: (TWOPI * i) / count, speedScale: 1 })),
  scatter: count =>
    Array.from({ length: count }, () => ({ angle: randomRange(0, TWOPI), speedScale: randomRange(0.3, 1) })),
}
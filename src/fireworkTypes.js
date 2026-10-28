const DEFAULTS = { count: [8, 16], speed: [4, 8], radius: [4, 6], physics: {} };

export const FIREWORK_TYPES = {
  classic: { ...DEFAULTS, label: "Classic", pattern: "ring" },
  burst: { ...DEFAULTS, label: "Burst", pattern: "scatter", count: [24, 48], radius: [2.4, 3.6] },
}
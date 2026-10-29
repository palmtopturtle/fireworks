import { FireworkParticle } from "./entities/FireworkParticle.js";
import { WillowParticle } from "./entities/WillowParticle.js";

const DEFAULTS = { count: [8, 16], speed: [4, 8], radius: [4, 6], physics: {}, particleClass: FireworkParticle };

export const FIREWORK_TYPES = {
  classic: { ...DEFAULTS, label: "Classic", pattern: "ring" },
  burst: { ...DEFAULTS, label: "Burst", pattern: "scatter", count: [24, 48], radius: [2.4, 3.6] },
  willow: {
    ...DEFAULTS,
    label: "Willow",
    pattern: "sphere",
    count: [30, 40],
    speed: [3.5, 5],
    radius: [2, 3],
    physics: { drag: 0.975, gravity: 0.06, fadeStart: 80, fadeRate: 0.02 },
    particleClass: WillowParticle,
  },
}
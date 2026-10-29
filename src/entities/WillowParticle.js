// entities/WillowParticle.js
import { FireworkParticle } from "./FireworkParticle.js";
import { Spark } from "./Spark.js";
import { randomRange } from "../utils.js";

const TRAIL_SPACING = 4; // Distance travelled per spark
const TRAIL_DELAY = 6; // Frames before the trail starts; keeps the burst center clean
const INHERIT = 0.5; // Fraction of the particle's velocity each spark keeps
const JITTER = 0.05;
const FADE_RATE = 0.02;

export class WillowParticle extends FireworkParticle {
  constructor(options) {
    super(options);
    this.display = options.display;
    this.trailProgress = 0;
  }

  update(dt) {
    const prevX = this.x, prevY = this.y;
    super.update(dt);
    if (this.age < TRAIL_DELAY) return;

    this.trailProgress += Math.hypot(this.x - prevX, this.y - prevY) / TRAIL_SPACING; // Distance between X and Y
    while (this.trailProgress >= 1 && this.alpha > 0.2) {
      this.trailProgress -= 1;
      const t = Math.random();
      this.display.add(new Spark({
        x: prevX + (this.x - prevX) * t,
        y: prevY + (this.y - prevY) * t,
        hue: this.hue,
        vx: this.vx * INHERIT + randomRange(-JITTER, JITTER),
        vy: this.vy * INHERIT + randomRange(-JITTER, JITTER),
        fadeRate: FADE_RATE,
      }));
    }
  }
}
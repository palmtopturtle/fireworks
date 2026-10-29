import { worldHeight } from "../canvas.js";
import { drawGlow } from "../sprites.js";
import { randomRange } from "../utils.js";
import { Spark } from "./Spark.js";
import { PATTERNS } from "../explosionPatterns.js";

const ROCKET_GRAVITY = 0.35;
const SPARK_SPACING = 6; // How far a rocket must travel to generate a spark

export class FireworkRocket {
  constructor({ x, yTarget, display, type }) {
    this.x = x;
    this.yTarget = yTarget;
    this.display = display;
    this.type = type;
    this.y = worldHeight; // Always starts at bottom
    this.isExploded = false;
    this.particleCount = Math.floor(randomRange(8, 16));

    const height = this.y - yTarget;
    this.vy = -Math.sqrt(2 * ROCKET_GRAVITY * height); // More natural deceleration using gravity physics

    this.hue = Math.floor(randomRange(0, 360)); // Color is consistent across each particle created from a firework instance

    this.numGeneratedSparks = 0; // Can spawn more than 1 when firework moves upwards at speeds greater than 6px per frame
  }

  get isDead() {
    return this.isExploded;
  }

  createExplosion() {
    const type = this.type;
    const count = Math.floor(randomRange(...type.count));
    const speed = randomRange(...type.speed); // Shared by every particle in this explosion
    const radius = randomRange(...type.radius);
    const ParticleClass = type.particleClass;

    for (const { angle, speedScale } of PATTERNS[type.pattern](count)) {
      this.display.add(new ParticleClass({
        x: this.x,
        y: this.y,
        angle,
        radius,
        hue: this.hue,
        speed: speed * speedScale,
        display: this.display,
        ...type.physics,
      }));
    }

    this.isExploded = true; // Flags firework for removal
  }

  update(dt) {
    const prevY = this.y;
    this.vy += ROCKET_GRAVITY * dt;
    this.y += this.vy * dt;
    this.emitSparks(prevY, this.y);

    if (!this.isExploded && this.vy >= 0) {
      this.y = this.yTarget;
      this.createExplosion();
    }
  }

  emitSparks(fromY, toY) {
    this.numGeneratedSparks += Math.abs(toY - fromY) / SPARK_SPACING;
    while (this.numGeneratedSparks >= 1) {
      this.numGeneratedSparks -= 1;

      // Place each spark somewhere along this frame's path
      const y = fromY + (toY - fromY) * Math.random();
      this.display.add(new Spark({ x: this.x, y, hue: this.hue, vy: this.vy * 0.15 + randomRange(0.5, 1.5) }));
    }
  }

  draw() {
    drawGlow(this.hue, 2, this.x, this.y);
  }
}

import { ROCKET_GRAVITY, SPARK_SPACING } from "../constants.js";
import { worldHeight } from "../canvas.js";
import { drawGlow } from "../sprites.js";
import { randomRange, calcXVelocity, calcYVelocity } from "../utils.js";
import { FireworkParticle } from "./FireworkParticle.js";
import { Spark } from "./Spark.js";

export class FireworkRocket {
  constructor(x, yTarget, display) {
    this.x = x;
    this.yTarget = yTarget;
    this.display = display;
    this.y = worldHeight; // Always starts at bottom
    this.isExploded = false;
    this.particleCount = Math.floor(randomRange(8, 16));

    const height = this.y - yTarget;
    this.vy = -Math.sqrt(2 * ROCKET_GRAVITY * height); // More natural deceleration using gravity physics

    // Speed, radius, and color are consistent across each particle created from a firework instance
    this.speed = randomRange(4, 8);
    this.radius = randomRange(4, 6);
    this.hue = Math.floor(randomRange(0, 360));

    this.numGeneratedSparks = 0; // Can spawn more than 1 when firework moves upwards at speeds greater than 6px per frame
  }

  get isDead() {
    return this.isExploded;
  }

  createExplosion() {
    for (let i = 0; i < this.particleCount; i++) {
      const dx = calcXVelocity(i, this.particleCount);
      const dy = calcYVelocity(i, this.particleCount);
      this.display.add(new FireworkParticle(this, dx, dy));
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
      this.display.add(new Spark(this.x, y, this.hue, this.vy * 0.15 + randomRange(0.5, 1.5)));
    }
  }

  draw() {
    drawGlow(this.hue, 2, this.x, this.y);
  }
}

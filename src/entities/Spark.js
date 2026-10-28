import { SPARK_GRAVITY, SPARK_DRAG } from "../constants.js";
import { drawGlow } from "../sprites.js";
import { randomRange } from "../utils.js";

export class Spark {
  constructor(x, y, hue, vy) {
    this.x = x;
    this.y = y;
    this.hue = hue;
    this.vx = randomRange(-0.4, 0.4);
    this.vy = vy;
    this.radius = 1.5;
    this.alpha = randomRange(0.6, 0.9);
  }

  get isDead() {
    return this.alpha <= 0;
  }

  update(dt) {
    this.vy += SPARK_GRAVITY * dt;
    this.vx *= SPARK_DRAG ** dt;
    this.vy *= SPARK_DRAG ** dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.alpha = Math.max(0, this.alpha - 0.035 * dt);
  }

  draw() {
    drawGlow(this.hue, this.radius, this.x, this.y, this.alpha);
  }
}

import { drawGlow } from "../sprites.js";
import { randomRange } from "../utils.js";

const SPARK_GRAVITY = 0.08;
const SPARK_DRAG = 0.96;
const RADIUS = 1.5;

export class Spark {
  constructor({ x, y, hue, vx = randomRange(-0.4, 0.4), vy, fadeRate = 0.035, alpha = randomRange(0.6, 0.9) }) {
    this.x = x;
    this.y = y;
    this.hue = hue;
    this.vx = vx;
    this.vy = vy;
    this.fadeRate = fadeRate;
    this.radius = RADIUS;
    this.alpha = alpha;
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
    this.alpha = Math.max(0, this.alpha - this.fadeRate * dt);
  }

  draw() {
    drawGlow(this.hue, this.radius, this.x, this.y, this.alpha);
  }
}

import { drawGlow } from "../sprites.js";

export class FireworkParticle {
  constructor({ x, y, angle, speed, radius, hue,
    drag = 0.95, gravity = 0.025, fadeStart = 35, fadeRate = 0.01 }
  ) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = radius;
    this.hue = hue;
    this.drag = drag;
    this.gravity = gravity;
    this.fadeStart = fadeStart;
    this.fadeRate = fadeRate;
    this.age = 0;
    this.alpha = 1;
  }

  update(dt) {
    const drag = this.drag ** dt;
    this.vx *= drag;
    this.vy = this.vy * drag + this.gravity * dt; // gravity accumulates into curved path
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.age += dt;
    if (this.age > this.fadeStart) this.alpha = Math.max(0, this.alpha - this.fadeRate * dt);
  }

  draw() {
    drawGlow(this.hue, this.radius, this.x, this.y, this.alpha);
  }
}

import { FRICTION, PARTICLE_GRAVITY } from "../constants.js";
import { drawGlow } from "../sprites.js";

export class FireworkParticle {
  constructor(firework, dx, dy) {
    this.dx = dx;
    this.dy = dy;

    this.x = firework.x;
    this.y = firework.y;
    this.alpha = 1;
    this.speed = firework.speed;
    this.radius = firework.radius;
    this.hue = firework.hue;
  }

  get isDead() {
    return this.alpha <= 0;
  }

  update(dt) {
    this.speed *= FRICTION ** dt;
    this.x += this.dx * this.speed * dt;
    this.y += (this.dy * this.speed + PARTICLE_GRAVITY) * dt;
    if (this.speed < 1) {
      this.alpha = Math.max(0, this.alpha - 0.01 * dt);
    }
  }

  draw() {
    drawGlow(this.hue, this.radius, this.x, this.y, this.alpha);
  }
}

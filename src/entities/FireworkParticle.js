import { FRICTION, PARTICLE_GRAVITY } from "../constants.js";
import { drawGlow } from "../sprites.js";

export class FireworkParticle {
  constructor({
    x, y, angle, speed, radius, hue,
    friction = FRICTION,
    gravity = PARTICLE_GRAVITY,
    fadeRate = 0.01,
  }) {
    this.x = x;
    this.y = y;
    this.dx = Math.cos(angle);
    this.dy = Math.sin(angle);
    this.speed = speed;
    this.radius = radius;
    this.hue = hue;
    this.friction = friction;
    this.gravity = gravity;
    this.fadeRate = fadeRate;
    this.alpha = 1;
  }

  update(dt) {
    this.speed *= this.friction ** dt;
    this.x += this.dx * this.speed * dt;
    this.y += (this.dy * this.speed + this.gravity) * dt;
    if (this.speed < 1) this.alpha = Math.max(0, this.alpha - this.fadeRate * dt);
  }

  draw() {
    drawGlow(this.hue, this.radius, this.x, this.y, this.alpha);
  }
}

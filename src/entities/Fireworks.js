import { fireworksCanvas, worldWidth, worldHeight } from "../canvas.js";

/* Manages array of fireworks entities */
export class Fireworks {
  constructor() {
    this.entities = [];
  }

  add(entity) {
    this.entities.push(entity);
  }

  updateAll(dt) {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const e = this.entities[i];
      e.update(dt);
      if (e.isDead) this.entities.splice(i, 1);
    }
  }

  drawAll() {
    fireworksCanvas.clearRect(0, 0, worldWidth, worldHeight);
    for (const e of this.entities) e.draw();
  }
}

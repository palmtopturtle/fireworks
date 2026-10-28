import { STAR_DENSITY } from "../constants.js";
import { skyCanvas, viewWidth, viewHeight } from "../canvas.js";
import { Star } from "./Star.js";

/* Manages entities drawn for the night sky */
export class Sky {
  constructor() {
    this.stars = [];
    this.resize(window.innerWidth, window.innerHeight);
  }

  static calculateStarCount(width, height) {
    const count = Math.round(width * height * STAR_DENSITY);
    return Math.min(Math.max(count, 25), 500); // At least 25, at most 500 depending on screen size
  }

  // Attempts to gracefully prevent screen from becoming cluttered with stars or too sparse when resizing
  resize(width, height) {
    const target = Sky.calculateStarCount(width, height);
    while (this.stars.length < target) this.stars.push(new Star());
    this.stars.length = Math.min(this.stars.length, target); // Trims the extras
  }

  draw(t) {
    skyCanvas.clearRect(0, 0, viewWidth, viewHeight);
    for (const star of this.stars) star.draw(t);
  }
}

import { TWOPI, STAR_COLOR } from "../constants.js";
import { skyCanvas, viewWidth, viewHeight, stylePxl, snapToPxl } from "../canvas.js";
import { randomRange } from "../utils.js";

/* Sparkle helper */
function drawSparkle(x, y, arm, alpha) {
  const px = snapToPxl(x), py = snapToPxl(y);

  skyCanvas.fillStyle = `rgba(${STAR_COLOR}, ${alpha})`;
  skyCanvas.fillRect(px, py, stylePxl, stylePxl);

  // Four arms, dimming toward the tips
  for (let i = 1; i <= arm; i++) {
    skyCanvas.fillStyle = `rgba(${STAR_COLOR}, ${alpha * (1 - i / (arm + 1))})`;
    skyCanvas.fillRect(px + i * stylePxl, py, stylePxl, stylePxl); // +X
    skyCanvas.fillRect(px - i * stylePxl, py, stylePxl, stylePxl); // -X
    skyCanvas.fillRect(px, py + i * stylePxl, stylePxl, stylePxl); // +Y
    skyCanvas.fillRect(px, py - i * stylePxl, stylePxl, stylePxl); // -Y
  }
}

export class Star {
  constructor() {
    // Star positions are stored as fractions of the screen
    this.x = Math.random();
    this.y = Math.random() * 0.8; // Prevent stars from spawning on the bottom 1/5 of screen
    this.starType = Star.generateStarType();
    this.phase = randomRange(0, TWOPI);
    this.speed = randomRange(0.4, 1.2);
  }

  static generateStarType() {
    const r = Math.random();
    if (r < 0.6) return 0; // Plain dot
    if (r < 0.9) return 2; // Small sparkle
    return 3; // Big sparkle
  }

  glint(t) {
    const wave = Math.sin(t * 0.001 * this.speed + this.phase);
    return Math.max(0, wave) ** 4; // Mostly 0 with brief peaks
  }

  draw(t) {
    const glint = this.glint(t);
    const x = this.x * viewWidth;
    const y = this.y * viewHeight;

    if (this.starType === 0) {
      // Dots blink between dim and bright
      drawSparkle(x, y, 0, glint > 0.5 ? 0.95 : 0.55);
    } else {
      // Sparkles rest as a small plus, then pop out to full size
      const arm = Math.max(1, Math.round(glint * this.starType));
      drawSparkle(x, y, arm, 0.9);
    }
  }
}

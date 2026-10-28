import {
  fireworksCanvasElement,
  fireworksCanvas,
  setSize,
  viewWidth,
  viewHeight,
  worldScale,
} from "./canvas.js";
import { Fireworks } from "./entities/Fireworks.js";
import { FireworkRocket } from "./entities/FireworkRocket.js";
import { Sky } from "./sky/Sky.js";

const fireworksDisplay = new Fireworks();
const nightSkyDisplay = new Sky();

function handleResize() {
  setSize();
  nightSkyDisplay.resize(viewWidth, viewHeight);
}

/* Event Listeners */
window.addEventListener("load", handleResize);
window.addEventListener("resize", handleResize);

fireworksCanvasElement.addEventListener("pointerdown", e => {
  e.preventDefault();
  fireworksDisplay.add(
    new FireworkRocket(e.clientX / worldScale, e.clientY / worldScale, fireworksDisplay)
  );
});

/* Animation */
let lastTime = performance.now();

function animate(now) {
  requestAnimationFrame(animate);

  // Delta time for consistent rendering on different refresh rates
  const dt = Math.min((now - lastTime) / (1000 / 60), 3);
  lastTime = now;

  nightSkyDisplay.draw(now);

  fireworksCanvas.globalCompositeOperation = "lighter";
  fireworksDisplay.drawAll();
  fireworksDisplay.updateAll(dt);
}

requestAnimationFrame(animate);

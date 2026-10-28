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
import { pickRandomType, enabledTypes } from "./settings.js";
import { buildToolbox } from "./ui/toolbox.js";
import { FIREWORK_TYPES } from "./fireworkTypes.js";

const fireworksDisplay = new Fireworks();
const nightSkyDisplay = new Sky();

function handleResize() {
  setSize();
  nightSkyDisplay.resize(viewWidth, viewHeight);
}

buildToolbox(document.querySelector("[data-toolbox-options]"), FIREWORK_TYPES, enabledTypes);

/* Event Listeners */
window.addEventListener("load", handleResize);
window.addEventListener("resize", handleResize);

fireworksCanvasElement.addEventListener("pointerdown", e => {
  e.preventDefault();
  fireworksDisplay.add(new FireworkRocket({
    x: e.clientX / worldScale,
    yTarget: e.clientY / worldScale,
    display: fireworksDisplay,
    type: pickRandomType(),
  }));
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

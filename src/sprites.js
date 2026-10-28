import { fireworksCanvas } from "./canvas.js";

/* Memoized glowing sprites used for particles */
const spriteCache = new Map();

function getGlowSprite(hue, radius) {
  const r = Math.round(radius);
  const key = `${hue}-${r}`;
  if (spriteCache.has(key)) return spriteCache.get(key); // Reuse previously drawn sprite to reduce lag

  const size = r * 6; // Room for the halo around the core
  const spriteElement = document.createElement("canvas");
  spriteElement.width = spriteElement.height = size;
  const sprite = spriteElement.getContext("2d");

  const grad = sprite.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `hsla(${hue}, 100%, 95%, 1)`); // Hot white core
  grad.addColorStop(0.15, `hsla(${hue}, 100%, 70%, 0.9)`);
  grad.addColorStop(0.4, `hsla(${hue}, 100%, 60%, 0.25)`); // Soft halo
  grad.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
  sprite.fillStyle = grad;
  sprite.fillRect(0, 0, size, size);

  spriteCache.set(key, spriteElement);
  return spriteElement;
}

export function drawGlow(hue, radius, x, y, alpha = 1) {
  const sprite = getGlowSprite(hue, radius);
  fireworksCanvas.globalAlpha = alpha;
  fireworksCanvas.drawImage(sprite, x - sprite.width / 2, y - sprite.height / 2);
  fireworksCanvas.globalAlpha = 1;
}

/* Initialize canvases */
const fireworksCanvasElement = document.createElement("canvas");
const fireworksCanvas = fireworksCanvasElement.getContext("2d");
fireworksCanvasElement.className = "fireworks-display";
document.body.appendChild(fireworksCanvasElement);

const skyCanvasElement = document.createElement("canvas");
const skyCanvas = skyCanvasElement.getContext("2d");
skyCanvasElement.className = "sky-display";
document.body.prepend(skyCanvasElement);

const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const touchOrClick = "ontouchstart" in window ? "touchstart" : "click";

/* Fixes width=0 bug for iOS */
function setSize() {
    fireworksCanvasElement.width = skyCanvasElement.width = iOS ? screen.width : window.innerWidth;
    fireworksCanvasElement.height = skyCanvasElement.height = iOS ? screen.height : window.innerHeight;
    nightSkyDisplay?.resize(window.innerWidth, window.innerHeight);
}

/* Constants */
const TWOPI = Math.PI * 2;
const FRICTION = 0.95;
const PARTICLE_GRAVITY = 0.5;
const ROCKET_GRAVITY = 0.35;
const SPARK_SPACING = 6; // How far a rocket must travel to generatae a spark
const SPARK_GRAVITY = 0.08;
const SPARK_DRAG = 0.96;
const PXL = 2; // One "pixel" for consistent stylized, pixelated drawing
const STAR_COLOR = "255, 252, 235";
const STAR_DENSITY = 1 / 9000; // One star per ~95×95 px area

/* Event Listeners */
window.addEventListener("load", setSize);

fireworksCanvasElement.addEventListener(touchOrClick, e => {
  e.stopPropagation();
  e.preventDefault();
  if (touchOrClick === "click") {
    fireworksDisplay.add(new FireworkRocket(e.clientX, e.clientY));
  } else {
    // Necessary for iOS...
    fireworksDisplay.add(
      new FireworkRocket(e.touches[0].clientX, e.touches[0].clientY)
    );
  }
});

window.addEventListener("resize", setSize);

/* Utility and helpers */
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function calcXVelocity(angle, denominator) {
  return Math.cos((TWOPI * angle) / denominator);
}

function calcYVelocity(angle, denominator) {
  return Math.sin((TWOPI * angle) / denominator);
}

function snapToPxl(v) {
  return Math.round(v / PXL) * PXL;
}

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

function drawGlow(hue, radius, x, y, alpha = 1) {
  const sprite = getGlowSprite(hue, radius);
  fireworksCanvas.globalAlpha = alpha;
  fireworksCanvas.drawImage(sprite, x - sprite.width / 2, y - sprite.height / 2);
  fireworksCanvas.globalAlpha = 1;
}

/* Sparkle helper */
function drawSparkle(x, y, arm, alpha) {
  const px = snapToPxl(x), py = snapToPxl(y);

  skyCanvas.fillStyle = `rgba(${STAR_COLOR}, ${alpha})`;
  skyCanvas.fillRect(px, py, PXL, PXL);

  // Four arms, dimming toward the tips
  for (let i = 1; i <= arm; i++) {
    skyCanvas.fillStyle = `rgba(${STAR_COLOR}, ${alpha * (1 - i / (arm + 1))})`;
    skyCanvas.fillRect(px + i * PXL, py, PXL, PXL); // +X
    skyCanvas.fillRect(px - i * PXL, py, PXL, PXL); // -X
    skyCanvas.fillRect(px, py + i * PXL, PXL, PXL); // +Y
    skyCanvas.fillRect(px, py - i * PXL, PXL, PXL); // -Y
  }
}

/* Main Classees */
class FireworkRocket {
  constructor(x, yTarget) {
    this.x = x;
    this.yTarget = yTarget;
    this.y = fireworksCanvasElement.height; // Always starts at bottom
    this.isExploded = false;
    this.particleCount = Math.floor(randomRange(8, 16));

    const height = this.y - yTarget;
    this.vy = -Math.sqrt(2 * ROCKET_GRAVITY * height); // More natural deceleration using gravity physics

    // Speed, radius, and color are consistent across each particle created from a firework instance
    this.speed = randomRange(4, 8);
    this.radius = randomRange(4, 6);
    this.hue = Math.floor(randomRange(0, 360));

    this.numGeneratedSparks = 0; // Can spawn more than 1 when firework moves upwards at speeds greater than 6px per frame
  }

  get isDead() {
    return this.isExploded;
  }

  createExplosion() {
    for (let i = 0; i < this.particleCount; i++) {
      let dx = calcXVelocity(i, this.particleCount);
      let dy = calcYVelocity(i, this.particleCount);
      fireworksDisplay.add(new FireworkParticle(this, dx, dy));
    }
    this.isExploded = true; // Flags firework for removal
  }

  update(dt) {
    const prevY = this.y;
    this.vy += ROCKET_GRAVITY * dt;
    this.y += this.vy * dt;
    this.emitSparks(prevY, this.y);

    if (!this.isExploded && this.vy >= 0) {
      this.y = this.yTarget;
      this.createExplosion();
    }
  }

  emitSparks(fromY, toY) {
    this.numGeneratedSparks += Math.abs(toY - fromY) / SPARK_SPACING;
    while (this.numGeneratedSparks >= 1) {
      this.numGeneratedSparks -= 1;

      // Place each spark somewhere along this frame's path
      const y = fromY + (toY - fromY) * Math.random();
      fireworksDisplay.add(new Spark(this.x, y, this.hue, this.vy * 0.15 + randomRange(0.5, 1.5)));
    }
  }

  draw() {
    drawGlow(this.hue, 2, this.x, this.y);
  }
}

class FireworkParticle {
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

class Spark {
  constructor(x, y, hue, vy) {
    this.x = x;
    this.y = y;
    this.hue = hue;
    this.vx = randomRange(-0.4, 0.4);
    this.vy = vy;
    this.radius = 1.5;
    this.alpha = randomRange(0.6, 0.9);
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
    this.alpha = Math.max(0, this.alpha - 0.035 * dt);
  }

  draw() {
    drawGlow(this.hue, this.radius, this.x, this.y, this.alpha);
  }
}

class Star {
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
    const x = this.x * skyCanvasElement.width;
    const y = this.y * skyCanvasElement.height;

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

/* Manages array of fireworks entities */
class Fireworks {
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
    for (const e of this.entities) e.draw();
  }
}

/* Manages entities drawn for the night sky */
class Sky {
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
    skyCanvas.clearRect(0, 0, skyCanvasElement.width, skyCanvasElement.height);
    for (const star of this.stars) star.draw(t);
  }
}

/* Animation */
const fireworksDisplay = new Fireworks();
const nightSkyDisplay = new Sky();
let lastTime = performance.now();

function animate(now) {
  requestAnimationFrame(animate);

  // Delta time for consistent rendering on different refresh rates
  const dt = Math.min((now - lastTime) / (1000 / 60), 3);
  lastTime = now;

  nightSkyDisplay.draw(now);

  fireworksCanvas.clearRect(0, 0, fireworksCanvasElement.width, fireworksCanvasElement.height);
  fireworksCanvas.globalCompositeOperation = "lighter";
  fireworksDisplay.drawAll();
  fireworksDisplay.updateAll(dt);
}

animate();

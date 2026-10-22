/* Initialize Canvas */
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const c = canvas.getContext("2d"),
  iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
  touchOrClick = "ontouchstart" in window ? "touchstart" : "click";

/* Fixes width=0 bug for iOS */
function setSize() {
    canvas.width = iOS ? screen.width : window.innerWidth;
    canvas.height = iOS ? screen.height : window.innerHeight;
}

/* Constants */
const FRICTION = 0.95;
const PARTICLE_GRAVITY = 0.5;
const ROCKET_GRAVITY = 0.35;
const SPARK_SPACING = 6; // px of rocket travel per spark
const SPARK_GRAVITY = 0.08;
const SPARK_DRAG = 0.96;
const TWOPI = Math.PI * 2;

/* Event Listeners */
window.addEventListener("load", setSize);

canvas.addEventListener(touchOrClick, e => {
  e.stopPropagation();
  e.preventDefault();
  if (touchOrClick === "click") {
    mainDisplay.add(new Firework(e.clientX, e.clientY));
  } else {
    // Necessary for iOS...
    mainDisplay.add(
      new Firework(e.touches[0].clientX, e.touches[0].clientY)
    );
  }
});

window.addEventListener("resize", setSize);

/* Utility */
function random(min, max) {
  return Math.random() * (max - min) + min;
}

function calcXVelocity(angle, denominator) {
  return Math.cos((TWOPI * angle) / denominator);
}

function calcYVelocity(angle, denominator) {
  return Math.sin((TWOPI * angle) / denominator);
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
  grad.addColorStop(0,    `hsla(${hue}, 100%, 95%, 1)`); // Hot white core
  grad.addColorStop(0.15, `hsla(${hue}, 100%, 70%, 0.9)`);
  grad.addColorStop(0.4,  `hsla(${hue}, 100%, 60%, 0.25)`); // Soft halo
  grad.addColorStop(1,    `hsla(${hue}, 100%, 50%, 0)`);
  sprite.fillStyle = grad;
  sprite.fillRect(0, 0, size, size);

  spriteCache.set(key, spriteElement);
  return spriteElement;
}

function drawGlow(hue, radius, x, y, alpha = 1) {
  const sprite = getGlowSprite(hue, radius);
  c.globalAlpha = alpha;
  c.drawImage(sprite, x - sprite.width / 2, y - sprite.height / 2);
  c.globalAlpha = 1;
}

/* Main Classees */
class Firework {
  constructor(x, yTarget) {
    this.x = x;
    this.yTarget = yTarget;
    this.y = canvas.height; // Always starts at bottom
    this.isExploded = false;
    this.particleCount = Math.floor(random(8, 16));

    const height = this.y - yTarget;
    this.vy = -Math.sqrt(2 * ROCKET_GRAVITY * height); // More natural deceleration using gravity physics

    /* Speed, radius, and color are consistent across each particle created from a firework instance */
    this.speed = random(4, 8);
    this.radius = random(4, 6);
    this.hue = Math.floor(random(0, 360));

    this.sparkDebt = 0; // For when firework moves upwards at speeds greater than 6px per frame
  }

  get isDead() {
    return this.isExploded;
  }

  createExplosion() {
    for (let i = 0; i < this.particleCount; i++) {
      let dx = calcXVelocity(i, this.particleCount);
      let dy = calcYVelocity(i, this.particleCount);
      mainDisplay.add(new Particle(this, dx, dy));
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
    this.sparkDebt += Math.abs(toY - fromY) / SPARK_SPACING;
    while (this.sparkDebt >= 1) {
      this.sparkDebt -= 1;

      /* Place each spark somewhere along this frame's path */
      const y = fromY + (toY - fromY) * Math.random();
      mainDisplay.add(new Spark(this.x, y, this.hue, this.vy * 0.15 + random(0.5, 1.5)));
    }
  }

  draw() {
    drawGlow(this.hue, 2, this.x, this.y);
  }
}

class Particle {
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
    this.vx = random(-0.4, 0.4);
    this.vy = vy;
    this.radius = 1.5;
    this.alpha = random(0.6, 0.9);
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

/* Manages array of entities (fireworks, particles, etc.) */
class Display {
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

/* Animation */
const mainDisplay = new Display();
let lastTime = performance.now();

function animate(now) {
  requestAnimationFrame(animate);

  /* Delta time for consistent rendering on different refresh rates */
  const dt = Math.min((now - lastTime) / (1000 / 60), 3);
  lastTime = now;

  c.clearRect(0, 0, canvas.width, canvas.height);
  c.globalCompositeOperation = "lighter";
  mainDisplay.drawAll();
  mainDisplay.updateAll(dt);
}

animate();

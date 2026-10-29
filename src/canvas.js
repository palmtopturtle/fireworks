const MAX_DPR = 2;
const REFERENCE_SIZE = 640; // Smallest viewport size to render full world scale (worldScale = 1)
const MIN_WORLD_SCALE = 0.6; // Do not shrink scale beyond this
const PXL = 2; // One "pixel" for consistent stylized, pixelated drawing

/* Initialize canvases */
export const fireworksCanvasElement = document.createElement("canvas");
export const fireworksCanvas = fireworksCanvasElement.getContext("2d");
fireworksCanvasElement.className = "fireworks-display";
document.body.prepend(fireworksCanvasElement);

export const skyCanvasElement = document.createElement("canvas");
export const skyCanvas = skyCanvasElement.getContext("2d");
skyCanvasElement.className = "sky-display";
document.body.prepend(skyCanvasElement);

/* Handling canvas size and different resolutions/displays */
export let viewWidth = 0;
export let viewHeight = 0;
export let dpr = 1;
export let stylePxl = PXL; // Keep stylized pixels crisp on high resolution displays

export let worldScale = 1;
export let worldWidth = 0;
export let worldHeight = 0;

export function setSize() {
  viewWidth = fireworksCanvasElement.clientWidth;
  viewHeight = fireworksCanvasElement.clientHeight;
  dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  stylePxl = Math.max(1, Math.round(PXL * dpr)) / dpr;

  // On smaller viewports, decrease the size of the fireworks
  const smallestSize = Math.min(viewWidth, viewHeight);
  worldScale = Math.min(1, Math.max(MIN_WORLD_SCALE, smallestSize / REFERENCE_SIZE));
  worldWidth = viewWidth / worldScale;
  worldHeight = viewHeight / worldScale;

  // Use CSS viewport for proper canvas width and height
  for (const el of [fireworksCanvasElement, skyCanvasElement]) {
    el.width = Math.round(viewWidth * dpr);
    el.height = Math.round(viewHeight * dpr);
  }
  fireworksCanvas.setTransform(dpr * worldScale, 0, 0, dpr * worldScale, 0, 0); // Scale fireworks to world size
  skyCanvas.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function snapToPxl(v) {
  return Math.round(v / stylePxl) * stylePxl;
}

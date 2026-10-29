export const TWOPI = Math.PI * 2;

export function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function calcXVelocity(angle, denominator) {
  return Math.cos((TWOPI * angle) / denominator);
}

export function calcYVelocity(angle, denominator) {
  return Math.sin((TWOPI * angle) / denominator);
}

import { FIREWORK_TYPES } from "./fireworkTypes.js";

export const enabledTypes = new Set(["classic"]);

export function pickRandomType() {
  const keys = [...enabledTypes];
  return FIREWORK_TYPES[keys[Math.floor(Math.random() * keys.length)]];
}
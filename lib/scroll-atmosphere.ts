import { SCENE } from "./constants";

/**
 * Scroll-driven atmosphere for the neural background.
 * Density / pulse energy rise with scrollDepth ("deeper into the network").
 */
export type ScrollAtmosphere = {
  cameraZ: number;
  /** World-space Y the camera tracks — moves down the stack on scroll */
  travelY: number;
  /** 0–1 network density (edge visibility + brightness) */
  networkDensity: number;
  /** Relative pulse spawn energy 0–1 */
  pulseEnergy: number;
  nodeOpacity: number;
  edgeOpacity: number;
  bloomIntensity: number;
  /** Background brightness multiplier */
  bgBright: number;
  vignetteStrength: number;
  scrollDepth: number;
  heroOpacity: number;
  pageScroll: number;
  fogDensity: number;
  /** Subtle drift amplitude multiplier */
  driftAmount: number;
};

const DEFAULTS: ScrollAtmosphere = {
  cameraZ: SCENE.cameraZ,
  travelY: SCENE.travelYStart,
  networkDensity: 0.28,
  pulseEnergy: 0.18,
  nodeOpacity: 0.55,
  edgeOpacity: 0.2,
  bloomIntensity: 0.16,
  bgBright: 1,
  vignetteStrength: 0.38,
  scrollDepth: 0,
  heroOpacity: 1,
  pageScroll: 0,
  fogDensity: 0.028,
  driftAmount: 0.55,
};

export const scrollAtmosphere: ScrollAtmosphere = { ...DEFAULTS };

export function resetScrollAtmosphere() {
  Object.assign(scrollAtmosphere, DEFAULTS);
}

export function applyAtmosphereToDom() {
  const root = document.documentElement;
  root.style.setProperty("--atmosphere-bright", `${scrollAtmosphere.bgBright}`);
  root.style.setProperty("--vignette-strength", `${scrollAtmosphere.vignetteStrength}`);
  root.style.setProperty("--scroll-depth", `${scrollAtmosphere.scrollDepth}`);
  root.style.setProperty("--hero-opacity", `${scrollAtmosphere.heroOpacity}`);
  root.style.setProperty("--network-density", `${scrollAtmosphere.networkDensity}`);
  root.style.setProperty("--network-pulse", `${scrollAtmosphere.pulseEnergy}`);
}

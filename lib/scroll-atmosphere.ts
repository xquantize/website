import { SCENE } from "./constants";

export type ScrollAtmosphere = {
  cameraZ: number;
  particleOpacity: number;
  particleSpeed: number;
  bloomIntensity: number;
  waterHue: number;
  waterBright: number;
  vignetteStrength: number;
  scrollDepth: number;
  heroOpacity: number;
};

const DEFAULTS: ScrollAtmosphere = {
  cameraZ: SCENE.cameraZ,
  particleOpacity: 0.55,
  particleSpeed: 1,
  bloomIntensity: 0.4,
  waterHue: 0,
  waterBright: 1,
  vignetteStrength: 0.38,
  scrollDepth: 0,
  heroOpacity: 1,
};

export const scrollAtmosphere: ScrollAtmosphere = { ...DEFAULTS };

export function resetScrollAtmosphere() {
  Object.assign(scrollAtmosphere, DEFAULTS);
}

export function applyAtmosphereToDom() {
  const root = document.documentElement;
  root.style.setProperty("--atmosphere-hue", `${scrollAtmosphere.waterHue}deg`);
  root.style.setProperty("--atmosphere-bright", `${scrollAtmosphere.waterBright}`);
  root.style.setProperty(
    "--vignette-strength",
    `${scrollAtmosphere.vignetteStrength}`,
  );
  root.style.setProperty("--scroll-depth", `${scrollAtmosphere.scrollDepth}`);
  root.style.setProperty("--hero-opacity", `${scrollAtmosphere.heroOpacity}`);
}

export const COLORS = {
  bg: "#0c0f12",
  text: "#ebe6dc",
  accent: "#c4a484",
} as const;

export const SCENE = {
  fogDensity: 0.02,
  cameraZ: 10.5,
  fov: 42,
  /**
   * Classic 3-in MLP plate; scroll slides layers through the viewport.
   */
  travelYStart: 3.6,
  travelYEnd: -3.8,
  parallaxStrength: { x: 0.05, y: 0.02 },
} as const;

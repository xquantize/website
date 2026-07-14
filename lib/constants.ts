export const COLORS = {
  bg: "#081420",
  text: "#f5f0e8",
  accent: "#7dd3c0",
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

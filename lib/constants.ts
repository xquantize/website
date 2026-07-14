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
   * ~4 layers in view as a readable MLP plate; scroll slides the whole plate
   * upward so layers clearly enter/leave (not a single fixed row of dots).
   */
  travelYStart: 3.2,
  travelYEnd: -3.6,
  parallaxStrength: { x: 0.05, y: 0.02 },
} as const;

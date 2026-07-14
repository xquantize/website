export const COLORS = {
  bg: "#081420",
  text: "#f5f0e8",
  accent: "#7dd3c0",
} as const;

export const SCENE = {
  fogDensity: 0.018,
  cameraZ: 18,
  /** Narrow FOV keeps the column diagram nearly flat / orthographic-feeling */
  fov: 32,
  /** Camera focus Y at top of page (near first layers) → bottom (deeper layers) */
  travelYStart: 3.6,
  travelYEnd: -3.8,
  /** Keep parallax gentle so the right-column network stays framed */
  parallaxStrength: { x: 0.1, y: 0.06 },
} as const;

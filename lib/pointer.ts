/** Shared pointer position for cursor, camera, and particles. */
export const pointer = {
  x: 0,
  y: 0,
  /** Normalized -1 … 1 */
  nx: 0,
  ny: 0,
};

let listening = false;

export function ensurePointerListener() {
  if (listening || typeof window === "undefined") return;
  listening = true;

  window.addEventListener(
    "mousemove",
    (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.nx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ny = (e.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true },
  );
}

export type Boid = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
};

export type SchoolOptions = {
  centerZ: number;
  centerX: number;
  bounds: { x: number; y: number };
  boundsY: { min: number; max: number };
  maxSpeed: number;
  speedMul: number;
  separation: number;
  alignment: number;
  cohesion: number;
  cursorRepel: number;
  boundsForce: number;
  verticalDrift: number;
};

export type PointerWorld = {
  x: number;
  y: number;
  active: boolean;
};

/** Viewport height for fish — they wrap here so schools stay on screen. */
export const FISH_VIEW_HALF = 7.5;

const SEPARATION_RADIUS = 0.85;
const ALIGNMENT_RADIUS = 1.8;
const COHESION_RADIUS = 2.4;
const CURSOR_RADIUS = 3.5;

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function createSchool(
  count: number,
  centerZ: number,
  spread: { x: number; y: number; z: number },
  seed = 0,
  centerX = 0,
): Boid[] {
  const boids: Boid[] = [];
  for (let i = 0; i < count; i++) {
    const r = seededRandom(seed + i * 1.7);
    const r2 = seededRandom(seed + i * 2.9);
    const r3 = seededRandom(seed + i * 4.1);
    boids.push({
      x: centerX + (r - 0.5) * spread.x,
      y: (r2 - 0.5) * spread.y,
      z: centerZ + (r3 - 0.5) * spread.z,
      vx: (seededRandom(seed + i * 5.3) - 0.5) * 0.04,
      vy: (seededRandom(seed + i * 6.7) - 0.5) * 0.04,
      vz: 0,
    });
  }
  return boids;
}

function wrapY(y: number, min: number, max: number) {
  const range = max - min;
  let v = y;
  while (v < min) v += range;
  while (v > max) v -= range;
  return v;
}

export function stepSchool(boids: Boid[], options: SchoolOptions, pointer: PointerWorld) {
  const { boundsY, centerX } = options;
  const yRange = boundsY.max - boundsY.min;

  for (const boid of boids) {
    let sepX = 0;
    let sepY = 0;
    let sepZ = 0;
    let aliX = 0;
    let aliY = 0;
    let aliZ = 0;
    let cohX = 0;
    let cohY = 0;
    let cohZ = 0;
    let sepCount = 0;
    let aliCount = 0;
    let cohCount = 0;

    for (const other of boids) {
      if (other === boid) continue;

      const dx = boid.x - other.x;
      let dy = boid.y - other.y;
      if (Math.abs(dy) > yRange * 0.5) {
        dy = dy > 0 ? dy - yRange : dy + yRange;
      }
      const dz = boid.z - other.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < 0.001) continue;

      if (dist < SEPARATION_RADIUS) {
        sepX += dx / dist;
        sepY += dy / dist;
        sepZ += dz / dist;
        sepCount++;
      }
      if (dist < ALIGNMENT_RADIUS) {
        aliX += other.vx;
        aliY += other.vy;
        aliZ += other.vz;
        aliCount++;
      }
      if (dist < COHESION_RADIUS) {
        cohX += other.x;
        cohY += other.y;
        cohZ += other.z;
        cohCount++;
      }
    }

    let ax = 0;
    let ay = 0;
    let az = 0;

    if (sepCount > 0) {
      ax += (sepX / sepCount) * options.separation;
      ay += (sepY / sepCount) * options.separation;
      az += (sepZ / sepCount) * options.separation;
    }
    if (aliCount > 0) {
      ax += (aliX / aliCount - boid.vx) * options.alignment;
      ay += (aliY / aliCount - boid.vy) * options.alignment;
      az += (aliZ / aliCount - boid.vz) * options.alignment;
    }
    if (cohCount > 0) {
      cohX /= cohCount;
      cohY /= cohCount;
      cohZ /= cohCount;
      ax += (cohX - boid.x) * options.cohesion;
      ay += (cohY - boid.y) * options.cohesion;
      az += (cohZ - boid.z) * options.cohesion;
    }

    if (pointer.active) {
      const pdx = boid.x - pointer.x;
      const pdy = boid.y - pointer.y;
      const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
      if (pdist < CURSOR_RADIUS && pdist > 0.05) {
        const strength = ((CURSOR_RADIUS - pdist) / CURSOR_RADIUS) * options.cursorRepel;
        ax += (pdx / pdist) * strength;
        ay += (pdy / pdist) * strength;
      }
    }

    const { bounds, boundsForce, centerZ, verticalDrift } = options;
    const localX = bounds.x * 0.55;
    if (boid.x < centerX - localX) ax += boundsForce;
    else if (boid.x > centerX + localX) ax -= boundsForce;

    ay += verticalDrift;

    boid.vx += ax;
    boid.vy += ay;
    boid.vz += az;

    boid.vz *= 0.9;
    boid.vz += (centerZ - boid.z) * 0.004;

    const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy + boid.vz * boid.vz);
    if (speed > options.maxSpeed) {
      const scale = options.maxSpeed / speed;
      boid.vx *= scale;
      boid.vy *= scale;
      boid.vz *= scale;
    }

    boid.x += boid.vx * options.speedMul;
    boid.y += boid.vy * options.speedMul;
    boid.z += boid.vz * options.speedMul;

    boid.y = wrapY(boid.y, boundsY.min, boundsY.max);
  }
}

/** Scroll nudges schools up/down through the viewport. */
export function fishScrollDrift(pageScroll: number) {
  return (pageScroll - 0.5) * 0.006;
}

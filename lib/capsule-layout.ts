import type { Capsule } from "@/lib/capsules";
import { inferScale, visualStyleForCapsule, type CapsuleMoodStyle, type CapsuleShape } from "@/lib/capsule-mood";
import { isCapsuleOpen } from "@/lib/countdown";

export type CapsulePlacement = {
  id: string;
  x: number;
  y: number;
  size: number;
  tilt: number;
  duration: number;
  delay: number;
  amplitude: number;
  dx: number;
  z: number;
  rise: number;
};

function hashString(input: string) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function unit(id: string, salt: string) {
  return hashString(`${id}:${salt}`) / 4_294_967_295;
}

function range(id: string, salt: string, min: number, max: number) {
  return min + unit(id, salt) * (max - min);
}

export function daysUntilOpen(openAt: Date | null, now: Date) {
  if (!openAt) {
    return 0;
  }

  return (openAt.getTime() - now.getTime()) / 86_400_000;
}

export function riseAmount(openAt: Date | null, now: Date) {
  if (isCapsuleOpen(openAt, now)) {
    return 1;
  }

  const days = Math.max(0, daysUntilOpen(openAt, now));
  return 1 - Math.min(1, Math.log1p(days) / Math.log1p(380));
}

const SHAPE_MOTION: Record<CapsuleShape, { duration: number; amplitude: number; dx: number }> = {
  bottle: { duration: 6.2, amplitude: 46, dx: 28 },
  droplet: { duration: 4.6, amplitude: 58, dx: 22 },
  crystal: { duration: 6.8, amplitude: 38, dx: 18 },
  orb: { duration: 5.1, amplitude: 64, dx: 32 },
  cloud: { duration: 8.4, amplitude: 42, dx: 44 },
  seed: { duration: 7.8, amplitude: 36, dx: 20 },
  lantern: { duration: 5.4, amplitude: 70, dx: 26 },
  hourglass: { duration: 6.6, amplitude: 40, dx: 24 },
};

function styleOf(capsule: Capsule): CapsuleMoodStyle {
  return visualStyleForCapsule(capsule);
}

export function layoutCapsules(capsules: Capsule[], now: Date): CapsulePlacement[] {
  const count = Math.max(1, capsules.length);
  const golden = Math.PI * (3 - Math.sqrt(5));

  const raw = capsules.map((capsule, index) => {
    const rise = riseAmount(capsule.openAt, now);
    const style = styleOf(capsule);
    const shape = style.shape;
    const motion = SHAPE_MOTION[shape];
    const scale = style.scale ?? inferScale(shape);
    const energy = 0.85 + rise * 0.45;
    const angle = index * golden + range(capsule.id, "spin", -0.35, 0.35);
    const radius = 0.22 + 0.7 * Math.sqrt((index + 0.55) / count);

    return {
      id: capsule.id,
      x: clamp(50 + Math.cos(angle) * radius * 42 + range(capsule.id, "jx", -4, 4), 11, 89),
      y: clamp(
        54 + Math.sin(angle) * radius * 36 - rise * 18 + range(capsule.id, "jy", -5, 5),
        18,
        86,
      ),
      size: Math.round((132 + rise * 28 + range(capsule.id, "size", -18, 22)) * scale),
      tilt: range(capsule.id, "tilt", -18, 18),
      duration: Math.max(4.2, motion.duration / energy),
      delay: range(capsule.id, "delay", 0, 4.8),
      amplitude: motion.amplitude * energy,
      dx: motion.dx * (0.7 + unit(capsule.id, "dx") * 0.8),
      z: Math.round(rise * 24 + unit(capsule.id, "z") * 8),
      rise,
    } satisfies CapsulePlacement;
  });

  const sorted = [...raw].sort((left, right) => left.y - right.y || left.x - right.x);

  for (let pass = 0; pass < 6; pass += 1) {
    for (let index = 1; index < sorted.length; index += 1) {
      const current = sorted[index];

      for (let prior = 0; prior < index; prior += 1) {
        const other = sorted[prior];
        const dx = current.x - other.x;
        const dy = current.y - other.y;
        const minX = 16 + Math.min(current.size, other.size) / 22;
        const minY = 20;

        if (Math.abs(dx) >= minX || Math.abs(dy) >= minY) {
          continue;
        }

        const push = (minX - Math.abs(dx)) / 2 + 1.6;
        if (dx >= 0) {
          current.x = Math.min(90, current.x + push);
          other.x = Math.max(10, other.x - push * 0.4);
        } else {
          current.x = Math.max(10, current.x - push);
          other.x = Math.min(90, other.x + push * 0.4);
        }

        if (Math.abs(current.y - other.y) < minY) {
          current.y = clamp(current.y + 3.2, 16, 88);
        }
      }
    }
  }

  return sorted;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

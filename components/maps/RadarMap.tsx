"use client";

import { useMemo } from "react";
import { MAP, MAP_HEIGHT } from "@/lib/cities";
import type { MapCity } from "./types";
import { BaseSvgMap } from "./BaseSvgMap";

// Heat ramp: cool blue → extreme red, in normalized 0..1.
const STOPS: [number, [number, number, number]][] = [
  [0.0, [77, 163, 255]],
  [0.28, [127, 178, 232]],
  [0.55, [250, 178, 25]],
  [0.78, [236, 131, 90]],
  [1.0, [208, 59, 59]],
];

function heatColor(t: number): string {
  const x = Math.max(0, Math.min(1, t));
  for (let i = 1; i < STOPS.length; i++) {
    if (x <= STOPS[i][0]) {
      const [x0, c0] = STOPS[i - 1];
      const [x1, c1] = STOPS[i];
      const f = (x - x0) / (x1 - x0 || 1);
      const r = Math.round(c0[0] + (c1[0] - c0[0]) * f);
      const g = Math.round(c0[1] + (c1[1] - c0[1]) * f);
      const b = Math.round(c0[2] + (c1[2] - c0[2]) * f);
      return `rgb(${r},${g},${b})`;
    }
  }
  return `rgb(208,59,59)`;
}

const COLS = 26;

// Variant 3 — accurate outline + interpolated temperature field (weather-radar
// look). Inverse-distance weighting from the 8 city readings, clipped to land.
export function RadarMap({
  cities,
  selected,
  onSelect,
  hourIndex,
}: {
  cities: MapCity[];
  selected: string | null;
  onSelect: (slug: string) => void;
  hourIndex?: number;
}) {
  const cells = useMemo(() => {
    const size = MAP.width / COLS;
    const rows = Math.ceil(MAP_HEIGHT / size);
    const at = (c: MapCity) =>
      hourIndex != null && c.hourlyTemps[hourIndex] != null ? c.hourlyTemps[hourIndex] : c.temp;
    const temps = cities.map(at);
    const tMin = Math.min(...temps);
    const tMax = Math.max(...temps);
    const span = Math.max(1, tMax - tMin);
    const out: { x: number; y: number; s: number; fill: string }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < COLS; col++) {
        const cx = col * size + size / 2;
        const cy = r * size + size / 2;
        let wsum = 0;
        let vsum = 0;
        for (const c of cities) {
          const dx = cx - c.x;
          const dy = cy - c.y;
          const w = 1 / (dx * dx + dy * dy + 400); // eps softens near-city spikes
          wsum += w;
          vsum += w * at(c);
        }
        const t = (vsum / wsum - tMin) / span;
        out.push({ x: col * size, y: r * size, s: size, fill: heatColor(t) });
      }
    }
    return out;
  }, [cities, hourIndex]);

  const field = (
    <g filter="url(#radar-blur)" opacity="0.6">
      <defs>
        <filter id="radar-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={MAP.width / COLS * 0.9} />
        </filter>
      </defs>
      {cells.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={c.s + 1} height={c.s + 1} fill={c.fill} />
      ))}
    </g>
  );

  return <BaseSvgMap cities={cities} selected={selected} onSelect={onSelect} field={field} />;
}

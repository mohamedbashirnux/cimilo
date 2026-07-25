"use client";

import { useEffect, useRef } from "react";
import { MAP, MAP_HEIGHT, SOMALIA_PATH, project } from "@/lib/cities";
import { SOMALIA_RING } from "@/lib/somalia-geo";
import type { MapCity } from "./types";
import { CityMarker, MapDefs } from "./markers";

// Projected country ring, for keeping particles over land.
const RING = SOMALIA_RING.map(([lo, la]) => project(lo, la));
const BBOX = RING.reduce(
  (b, p) => ({ minX: Math.min(b.minX, p.x), maxX: Math.max(b.maxX, p.x), minY: Math.min(b.minY, p.y), maxY: Math.max(b.maxY, p.y) }),
  { minX: 1e9, maxX: -1e9, minY: 1e9, maxY: -1e9 },
);

function inLand(x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = RING.length - 1; i < RING.length; j = i++) {
    const xi = RING[i].x, yi = RING[i].y, xj = RING[j].x, yj = RING[j].y;
    if (((yi > y) !== (yj > y)) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function speedColor(sp: number, a: number): string {
  if (sp < 15) return `rgba(77,163,255,${a})`;
  if (sp < 28) return `rgba(56,189,248,${a})`;
  if (sp < 42) return `rgba(250,178,25,${a})`;
  return `rgba(236,90,90,${a})`;
}

type Particle = { x: number; y: number; age: number; max: number };

// Variant 4 — wind-particle flow. Thousands of dots stream across the country
// following an interpolated wind field, coloured by speed (like windy.com).
export function WindFlowMap({
  cities,
  selected,
  onSelect,
}: {
  cities: MapCity[];
  selected: string | null;
  onSelect: (slug: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const W = (canvas.width = MAP.width);
    const H = (canvas.height = MAP_HEIGHT);

    // per-city wind unit vector (travel dir) + speed, in screen space
    const vecs = cities.map((c) => {
      const rad = (((c.windDirection + 180) % 360 - 90) * Math.PI) / 180;
      return { x: c.x, y: c.y, u: Math.cos(rad), v: Math.sin(rad), sp: c.windSpeed };
    });

    const windAt = (x: number, y: number) => {
      let wu = 0, wv = 0, ws = 0, tot = 0;
      for (const g of vecs) {
        const dx = x - g.x, dy = y - g.y;
        const w = 1 / (dx * dx + dy * dy + 3000);
        wu += w * g.u; wv += w * g.v; ws += w * g.sp; tot += w;
      }
      return { u: wu / tot, v: wv / tot, sp: ws / tot };
    };

    const spawn = (p: Particle) => {
      for (let i = 0; i < 30; i++) {
        const x = BBOX.minX + Math.random() * (BBOX.maxX - BBOX.minX);
        const y = BBOX.minY + Math.random() * (BBOX.maxY - BBOX.minY);
        if (inLand(x, y)) { p.x = x; p.y = y; p.age = 0; p.max = 25 + Math.random() * 45; return; }
      }
      p.x = -10; p.y = -10; p.age = 0; p.max = 1;
    };

    const N = 700;
    const parts: Particle[] = Array.from({ length: N }, () => {
      const p = { x: 0, y: 0, age: 0, max: 0 };
      spawn(p);
      p.age = Math.random() * p.max;
      return p;
    });

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    ctx.fillStyle = "#0b131b";
    ctx.fillRect(0, 0, W, H);

    if (reduced) {
      // static arrows on a grid — no animation
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      for (let y = BBOX.minY; y < BBOX.maxY; y += 55) {
        for (let x = BBOX.minX; x < BBOX.maxX; x += 55) {
          if (!inLand(x, y)) continue;
          const w = windAt(x, y);
          ctx.strokeStyle = speedColor(w.sp, 0.8);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + w.u * 26, y + w.v * 26);
          ctx.stroke();
        }
      }
      return;
    }

    let raf = 0;
    const frame = () => {
      ctx.fillStyle = "rgba(11,19,27,0.16)"; // fade → trails
      ctx.fillRect(0, 0, W, H);
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      for (const p of parts) {
        const w = windAt(p.x, p.y);
        const step = 2 + Math.min(1, w.sp / 55) * 7;
        const nx = p.x + w.u * step;
        const ny = p.y + w.v * step;
        ctx.strokeStyle = speedColor(w.sp, 0.85);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        p.x = nx; p.y = ny; p.age++;
        if (p.age > p.max || !inLand(p.x, p.y)) spawn(p);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [cities]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="block h-auto w-full rounded-xl" style={{ aspectRatio: `${MAP.width} / ${MAP_HEIGHT}` }} />
      <svg viewBox={`0 0 ${MAP.width} ${MAP_HEIGHT}`} className="absolute inset-0 h-full w-full" aria-hidden>
        <MapDefs />
        <path d={SOMALIA_PATH} fill="none" stroke="#4da3ff" strokeOpacity="0.55" strokeWidth="2.5" strokeLinejoin="round" />
        {cities.map((c) => (
          <CityMarker key={c.slug} c={c} active={c.slug === selected} onSelect={() => onSelect(c.slug)} />
        ))}
      </svg>
    </div>
  );
}

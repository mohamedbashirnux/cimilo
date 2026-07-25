"use client";

import type { MapCity } from "./types";
import { BaseSvgMap } from "./BaseSvgMap";

// Variant 1 — accurate self-contained outline. No tiles; fast on slow networks.
export function OutlineMap(props: { cities: MapCity[]; selected: string | null; onSelect: (slug: string) => void }) {
  return <BaseSvgMap {...props} />;
}

"use client";

import type { ReactNode } from "react";
import { MAP, MAP_HEIGHT, SOMALIA_PATH } from "@/lib/cities";
import type { MapCity } from "./types";
import { CityMarker, MapDefs, StormCells, WindStreaks } from "./markers";

// Shared SVG canvas: sea, graticule, wind streaks, country outline, markers.
// `field` (optional) is drawn clipped to the country — the radar variant uses it.
export function BaseSvgMap({
  cities,
  selected,
  onSelect,
  field,
}: {
  cities: MapCity[];
  selected: string | null;
  onSelect: (slug: string) => void;
  field?: ReactNode;
}) {
  return (
    <svg viewBox={`0 0 ${MAP.width} ${MAP_HEIGHT}`} className="h-auto w-full touch-manipulation" role="img" aria-label="Khariidad">
      <MapDefs />
      <clipPath id="land-clip">
        <path d={SOMALIA_PATH} />
      </clipPath>

      <rect x="0" y="0" width={MAP.width} height={MAP_HEIGHT} fill="url(#sea)" rx="16" />

      <g stroke="#1a2836" strokeWidth="1" opacity="0.5">
        {[0.2, 0.4, 0.6, 0.8].map((f) => (
          <line key={`h${f}`} x1="0" y1={MAP_HEIGHT * f} x2={MAP.width} y2={MAP_HEIGHT * f} />
        ))}
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={`v${f}`} x1={MAP.width * f} y1="0" x2={MAP.width * f} y2={MAP_HEIGHT} />
        ))}
      </g>

      {/* land fill */}
      <path d={SOMALIA_PATH} fill="url(#land)" />

      {/* optional data field, clipped to the country */}
      {field && <g clipPath="url(#land-clip)">{field}</g>}

      {/* drifting storm/rain cells, clipped to land */}
      <g clipPath="url(#land-clip)">
        <StormCells cities={cities} />
      </g>

      {/* ambient wind, then crisp border on top */}
      <WindStreaks />
      <path d={SOMALIA_PATH} fill="none" stroke="#4da3ff" strokeOpacity="0.6" strokeWidth="2.5" strokeLinejoin="round" />
      <path d={SOMALIA_PATH} fill="none" stroke="#4da3ff" strokeOpacity="0.12" strokeWidth="9" strokeLinejoin="round" />

      {cities.map((c) => (
        <CityMarker key={c.slug} c={c} active={c.slug === selected} onSelect={() => onSelect(c.slug)} />
      ))}
    </svg>
  );
}

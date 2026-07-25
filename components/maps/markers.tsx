import type { CSSProperties } from "react";
import type { MapCity } from "./types";
import { SEVERITY_COLOR } from "@/components/warnings";

// Ambient drifting wind streaks used on the SVG canvases.
export function WindStreaks() {
  return (
    <g stroke="#2f4a63" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5">
      {[
        [120, 300, 260], [640, 220, 200], [420, 640, 300],
        [720, 780, 240], [250, 980, 220], [560, 1080, 260],
      ].map(([x, y, w], i) => (
        <line
          key={i}
          className="wind-streak"
          x1={x}
          y1={y}
          x2={x + w}
          y2={y - 24}
          strokeDasharray="26 34"
          style={{ animationDelay: `${i * 0.5}s` }}
        />
      ))}
    </g>
  );
}

// A single city marker: severity halo/pulse, storm spin, wind vector, dot, labels.
export function CityMarker({
  c,
  active,
  onSelect,
}: {
  c: MapCity;
  active: boolean;
  onSelect: () => void;
}) {
  const color = SEVERITY_COLOR[c.severity];
  const isStorm = c.warnings.some((w) => w.type === "storm");
  const pulses = c.severity === "serious" || c.severity === "critical";

  // wind vector: bearing is "from", arrow points where the wind travels
  const travel = (c.windDirection + 180) % 360;
  const rad = ((travel - 90) * Math.PI) / 180;
  const reach = 20 + Math.min(1, c.windSpeed / 80) * 34;
  const wx = c.x + Math.cos(rad) * reach;
  const wy = c.y + Math.sin(rad) * reach;

  return (
    <g
      onClick={onSelect}
      onMouseEnter={onSelect}
      style={{ cursor: "pointer" }}
      tabIndex={0}
      role="button"
      aria-label={c.name}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
    >
      <circle cx={c.x} cy={c.y} r="46" fill="transparent" />

      {pulses && (
        <circle cx={c.x} cy={c.y} r="16" fill={color} className={`halo ${c.severity === "critical" ? "fast" : ""}`} />
      )}

      {isStorm && (
        <g className="storm-spin" style={{ transformOrigin: `${c.x}px ${c.y}px` }}>
          <path d={`M ${c.x} ${c.y - 26} A 26 26 0 0 1 ${c.x + 26} ${c.y}`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <path d={`M ${c.x} ${c.y + 26} A 26 26 0 0 1 ${c.x - 26} ${c.y}`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        </g>
      )}

      <line x1={c.x} y1={c.y} x2={wx} y2={wy} stroke="#4da3ff" strokeWidth="3" strokeLinecap="round" markerEnd="url(#map-wind)" opacity="0.9" />

      {active && <circle cx={c.x} cy={c.y} r="18" fill="none" stroke={color} strokeWidth="2.5" />}

      <circle cx={c.x} cy={c.y} r={active ? 12 : 10} fill={color} stroke="#0b0d10" strokeWidth="3" />
      <circle cx={c.x} cy={c.y} r="3.5" fill="#0b0d10" opacity="0.55" />

      <text x={c.x + 16} y={c.y - 8} fill={active ? "#f4f6f8" : "#c3ccd6"} fontSize="26" fontWeight={active ? 700 : 600}
        style={{ paintOrder: "stroke", stroke: "#0b0d10", strokeWidth: 6, strokeLinejoin: "round" }}>
        {c.name}
      </text>
      <text x={c.x + 16} y={c.y + 20} fill="#8a94a0" fontSize="23" fontWeight="600" className="tnum"
        style={{ paintOrder: "stroke", stroke: "#0b0d10", strokeWidth: 6, strokeLinejoin: "round" }}>
        {Math.round(c.temp)}°
      </text>
    </g>
  );
}

// Storm/rain cells that drift with the wind — a city with active precipitation
// grows a small rain cloud that moves in the wind's travel direction, labelled
// with its speed (km/h), so you can literally see the storm moving.
export function StormCells({ cities }: { cities: MapCity[] }) {
  const active = cities.filter(
    (c) => c.precip >= 0.1 || c.warnings.some((w) => w.type === "storm" || w.type === "rain" || w.type === "flood"),
  );
  return (
    <g>
      {active.map((c) => {
        const color = SEVERITY_COLOR[c.severity === "good" ? "warning" : c.severity];
        const travel = (c.windDirection + 180) % 360;
        const rad = ((travel - 90) * Math.PI) / 180;
        const dist = 70 + Math.min(1, c.windSpeed / 70) * 90;
        const dx = Math.cos(rad) * dist;
        const dy = Math.sin(rad) * dist;
        const dur = Math.max(2.6, 6.5 - c.windSpeed / 18);
        const isStorm = c.warnings.some((w) => w.type === "storm");
        const scale = isStorm ? 1.25 : 1;
        return (
          <g
            key={c.slug}
            className="storm-cell"
            style={
              {
                "--dx": `${dx}px`,
                "--dy": `${dy}px`,
                "--dur": `${dur}s`,
                "--peak": isStorm ? 0.75 : 0.5,
              } as CSSProperties
            }
          >
            {/* cloud body */}
            <ellipse cx={c.x} cy={c.y - 4} rx={26 * scale} ry={16 * scale} fill={color} opacity="0.5" />
            <ellipse cx={c.x - 14} cy={c.y} rx={16 * scale} ry={12 * scale} fill={color} opacity="0.4" />
            {/* rain streaks */}
            <g stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.85">
              <line x1={c.x - 12} y1={c.y + 10} x2={c.x - 15} y2={c.y + 22} />
              <line x1={c.x} y1={c.y + 12} x2={c.x - 3} y2={c.y + 26} />
              <line x1={c.x + 12} y1={c.y + 10} x2={c.x + 9} y2={c.y + 22} />
            </g>
            {/* speed label */}
            <text x={c.x} y={c.y - 26} fill="#dfe6ee" fontSize="18" fontWeight="700" textAnchor="middle" className="tnum"
              style={{ paintOrder: "stroke", stroke: "#0b0d10", strokeWidth: 5, strokeLinejoin: "round" }}>
              {Math.round(c.windSpeed)} km/h
            </text>
          </g>
        );
      })}
    </g>
  );
}

// Shared <defs> (wind arrowhead marker) for the SVG canvases.
export function MapDefs() {
  return (
    <defs>
      <radialGradient id="sea" cx="50%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#12202f" />
        <stop offset="100%" stopColor="#0b131b" />
      </radialGradient>
      <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1d2732" />
        <stop offset="100%" stopColor="#161d26" />
      </linearGradient>
      <marker id="map-wind" markerWidth="6" markerHeight="6" refX="3.4" refY="3" orient="auto">
        <path d="M0 0L6 3L0 6z" fill="#4da3ff" />
      </marker>
    </defs>
  );
}

"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import type { MapCity } from "./types";
import { SEVERITY_COLOR } from "@/components/warnings";
import { SOMALIA_RING } from "@/lib/somalia-geo";

const SOM_BOUNDS = L.latLngBounds([-1.9, 40.6], [12.4, 51.7]);
const OUTLINE: [number, number][] = SOMALIA_RING.map(([lon, lat]) => [lat, lon]);

function buildIcon(c: MapCity, active: boolean): L.DivIcon {
  const color = SEVERITY_COLOR[c.severity];
  const travel = (c.windDirection + 180) % 360;
  const ring = active ? `box-shadow:0 0 0 3px ${color}55;` : "";
  const html = `
    <div style="position:relative;transform:translate(-9px,-9px);white-space:nowrap;">
      <span style="position:absolute;left:-2px;top:-2px;width:22px;height:22px;border-radius:50%;
        display:flex;align-items:center;justify-content:center;background:${color};
        border:3px solid #0b0d10;${ring}">
        <svg width="12" height="12" viewBox="0 0 24 24" style="transform:rotate(${travel}deg)">
          <path d="M12 3 L12 21 M12 3 L7 9 M12 3 L17 9" stroke="#0b0d10" stroke-width="3.2"
            fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span style="position:absolute;left:26px;top:-9px;font:700 13px system-ui;color:#f4f6f8;
        text-shadow:0 0 4px #0b0d10,0 0 4px #0b0d10;">${c.name}</span>
      <span style="position:absolute;left:26px;top:7px;font:600 12px system-ui;color:#c3ccd6;
        text-shadow:0 0 4px #0b0d10,0 0 4px #0b0d10;">${Math.round(c.temp)}°</span>
    </div>`;
  return L.divIcon({ html, className: "", iconSize: [0, 0], iconAnchor: [0, 0] });
}

// Variant 2 — real interactive map (CartoDB dark tiles) with weather markers.
export default function LeafletMap({
  cities,
  selected,
  onSelect,
}: {
  cities: MapCity[];
  selected: string | null;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="h-[440px] w-full overflow-hidden rounded-xl sm:h-[540px]">
      <MapContainer
        bounds={SOM_BOUNDS}
        maxBounds={SOM_BOUNDS.pad(0.25)}
        minZoom={5}
        maxZoom={9}
        scrollWheelZoom={false}
        attributionControl={false}
        style={{ height: "100%", width: "100%", background: "#0b131b" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        <Polyline positions={OUTLINE} pathOptions={{ color: "#4da3ff", weight: 1.5, opacity: 0.7, fill: false }} />
        {cities.map((c) => (
          <Marker
            key={c.slug}
            position={[c.lat, c.lon]}
            icon={buildIcon(c, c.slug === selected)}
            eventHandlers={{ click: () => onSelect(c.slug) }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

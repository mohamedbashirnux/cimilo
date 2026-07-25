import { SOMALIA_RING } from "./somalia-geo";

// The eight main Somali cities Digniin covers, with real coordinates.
// `region` is the Somali federal member state / region name.

export type City = {
  slug: string;
  name: string; // Somali name (default)
  nameEn: string; // Latin/English exonym for reference
  region: string;
  lat: number;
  lon: number;
};

export const CITIES: City[] = [
  { slug: "muqdisho", name: "Muqdisho", nameEn: "Mogadishu", region: "Banaadir", lat: 2.0469, lon: 45.3182 },
  { slug: "hargeysa", name: "Hargeysa", nameEn: "Hargeisa", region: "Woqooyi Galbeed", lat: 9.5624, lon: 44.077 },
  { slug: "kismaayo", name: "Kismaayo", nameEn: "Kismayo", region: "Jubbada Hoose", lat: -0.3582, lon: 42.5454 },
  { slug: "boosaaso", name: "Boosaaso", nameEn: "Bosaso", region: "Bari", lat: 11.2842, lon: 49.1816 },
  { slug: "garoowe", name: "Garoowe", nameEn: "Garowe", region: "Nugaal", lat: 8.4054, lon: 48.4845 },
  { slug: "baydhabo", name: "Baydhabo", nameEn: "Baidoa", region: "Baay", lat: 3.1246, lon: 43.6506 },
  { slug: "beledweyne", name: "Beledweyne", nameEn: "Beledweyne", region: "Hiiraan", lat: 4.7358, lon: 45.2036 },
  { slug: "galkacyo", name: "Galkacyo", nameEn: "Galkayo", region: "Mudug", lat: 6.7697, lon: 47.4308 },
];

export function cityBySlug(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

// ── Map projection ──────────────────────────────────────────────────────────
// Equirectangular projection into a fixed SVG viewBox. Bounds are padded around
// the real border bbox (lon 40.96–51.39, lat -1.70–11.98). Width/height are
// sized so 1° lon ≈ 1° lat in pixels → the country isn't stretched. The same
// projection maps the outline and the city markers so they always align.

export const MAP = {
  width: 1000,
  lonMin: 40.5,
  lonMax: 51.9,
  latMin: -2.2,
  latMax: 12.5,
} as const;

// height derived from the aspect of the (padded) geographic bounds
export const MAP_HEIGHT = Math.round(
  MAP.width * ((MAP.latMax - MAP.latMin) / (MAP.lonMax - MAP.lonMin)),
);

export function project(lon: number, lat: number): { x: number; y: number } {
  const x = ((lon - MAP.lonMin) / (MAP.lonMax - MAP.lonMin)) * MAP.width;
  const y = ((MAP.latMax - lat) / (MAP.latMax - MAP.latMin)) * MAP_HEIGHT;
  return { x, y };
}

export const SOMALIA_PATH: string =
  SOMALIA_RING.map(([lon, lat], i) => {
    const { x, y } = project(lon, lat);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ") + " Z";

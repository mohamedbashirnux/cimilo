import type { Glyph, Severity, WarningType } from "@/lib/weather";

export type MapCity = {
  slug: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  x: number; // projected into MAP viewBox
  y: number;
  severity: Severity;
  temp: number;
  windSpeed: number;
  windGusts: number;
  windDirection: number;
  glyph: Glyph;
  isDay: boolean;
  condition: string;
  precip: number; // current precipitation (mm)
  hourlyTemps: number[]; // next ~24h temperatures, for the time slider
  warnings: { type: WarningType; severity: Exclude<Severity, "good">; value: string }[];
};

export const SEVERITY_RANK: Record<Severity, number> = { good: 0, warning: 1, serious: 2, critical: 3 };

export function mostSevere(cities: MapCity[]): string | null {
  return [...cities].sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity])[0]?.slug ?? null;
}

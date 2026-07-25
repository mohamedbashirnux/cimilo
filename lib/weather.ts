import { cache } from "react";
import { CITIES, type City } from "./cities";

// ── WMO weather codes ────────────────────────────────────────────────────────
// Each code maps to a Somali + English label and a "glyph" family the SVG icon
// component knows how to draw.

export type Glyph =
  | "clear"
  | "partly"
  | "cloud"
  | "fog"
  | "drizzle"
  | "rain"
  | "heavy-rain"
  | "showers"
  | "thunder";

type CodeInfo = { so: string; en: string; glyph: Glyph };

const CODE_TABLE: Record<number, CodeInfo> = {
  0: { so: "Cir saafi ah", en: "Clear sky", glyph: "clear" },
  1: { so: "Inta badan cir saafi", en: "Mainly clear", glyph: "clear" },
  2: { so: "Daruuro qaybo ah", en: "Partly cloudy", glyph: "partly" },
  3: { so: "Cir daruuro leh", en: "Overcast", glyph: "cloud" },
  45: { so: "Ceeryaamo", en: "Fog", glyph: "fog" },
  48: { so: "Ceeryaamo baraf leh", en: "Rime fog", glyph: "fog" },
  51: { so: "Tiixaan fudud", en: "Light drizzle", glyph: "drizzle" },
  53: { so: "Tiixaan dhexe", en: "Moderate drizzle", glyph: "drizzle" },
  55: { so: "Tiixaan xoog leh", en: "Dense drizzle", glyph: "drizzle" },
  56: { so: "Tiixaan qabow", en: "Freezing drizzle", glyph: "drizzle" },
  57: { so: "Tiixaan qabow xoog leh", en: "Dense freezing drizzle", glyph: "drizzle" },
  61: { so: "Roob fudud", en: "Slight rain", glyph: "rain" },
  63: { so: "Roob dhexe", en: "Moderate rain", glyph: "rain" },
  65: { so: "Roob culus", en: "Heavy rain", glyph: "heavy-rain" },
  66: { so: "Roob qabow", en: "Freezing rain", glyph: "rain" },
  67: { so: "Roob qabow culus", en: "Heavy freezing rain", glyph: "heavy-rain" },
  71: { so: "Baraf yar", en: "Slight snow", glyph: "showers" },
  73: { so: "Baraf dhexe", en: "Moderate snow", glyph: "showers" },
  75: { so: "Baraf badan", en: "Heavy snow", glyph: "showers" },
  77: { so: "Baraf xabbado", en: "Snow grains", glyph: "showers" },
  80: { so: "Tiigsi roob fudud", en: "Slight showers", glyph: "showers" },
  81: { so: "Roobab dhexe", en: "Moderate showers", glyph: "showers" },
  82: { so: "Roobab daran", en: "Violent showers", glyph: "heavy-rain" },
  85: { so: "Tiigsi baraf", en: "Snow showers", glyph: "showers" },
  86: { so: "Baraf badan", en: "Heavy snow showers", glyph: "showers" },
  95: { so: "Onkod iyo roob", en: "Thunderstorm", glyph: "thunder" },
  96: { so: "Onkod & roobdhagax", en: "Thunderstorm, hail", glyph: "thunder" },
  99: { so: "Onkod & roobdhagax daran", en: "Thunderstorm, heavy hail", glyph: "thunder" },
};

export function codeInfo(code: number): CodeInfo {
  return CODE_TABLE[code] ?? { so: "Cimilo caadi ah", en: "Unknown", glyph: "cloud" };
}

// ── Warnings ─────────────────────────────────────────────────────────────────

export type Severity = "good" | "warning" | "serious" | "critical";
export type WarningType = "storm" | "rain" | "wind" | "heat" | "flood";

// Cities on a major river — extra flood watch (Shabelle & Jubba flood often).
export const RIVER_CITY: Record<string, "Shabeelle" | "Jubba"> = {
  beledweyne: "Shabeelle",
  kismaayo: "Jubba",
};

// Cities on the coast — sea / fishing conditions available.
export const COASTAL_CITIES = ["muqdisho", "kismaayo", "boosaaso"] as const;

export type Warning = {
  type: WarningType;
  severity: Exclude<Severity, "good">;
  value: string; // short human value, e.g. "72 km/h"
};

const SEVERITY_RANK: Record<Severity, number> = { good: 0, warning: 1, serious: 2, critical: 3 };

export function maxSeverity(list: Severity[]): Severity {
  return list.reduce<Severity>((a, b) => (SEVERITY_RANK[b] > SEVERITY_RANK[a] ? b : a), "good");
}

// ── Types for the shaped data we hand to the UI ──────────────────────────────

export type CurrentWeather = {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  isDay: boolean;
  precipitation: number;
  weatherCode: number;
  cloudCover: number;
  pressure: number;
  windSpeed: number;
  windDirection: number; // degrees, direction FROM which wind blows
  windGusts: number;
};

export type ForecastDay = {
  date: string; // ISO date
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentMax: number;
  precipitation: number;
  precipitationProbability: number;
  windMax: number;
  windGustMax: number;
  windDirection: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
};

export type HourlyPoint = { time: string; temp: number; precip: number };

export type CityWeather = {
  city: City;
  current: CurrentWeather;
  daily: ForecastDay[];
  hourly: HourlyPoint[]; // next ~24 hours
  warnings: Warning[];
  severity: Severity; // highest active warning severity, else "good"
};

// Compute the active warnings for a city from its current conditions, today,
// and (for river cities) the multi-day rain outlook.
function computeWarnings(current: CurrentWeather, daily: ForecastDay[], slug: string): Warning[] {
  const out: Warning[] = [];
  const today = daily[0];

  // Storm — thunderstorm codes or damaging gusts.
  {
    const sev: Severity[] = ["good"];
    if (current.weatherCode === 95 || today.weatherCode === 95) sev.push("serious");
    if ([96, 99].includes(current.weatherCode) || [96, 99].includes(today.weatherCode)) sev.push("critical");
    const gust = Math.max(current.windGusts, today.windGustMax);
    if (gust >= 55) sev.push("serious");
    if (gust >= 70) sev.push("critical");
    const s = maxSeverity(sev);
    if (s !== "good") out.push({ type: "storm", severity: s, value: `${Math.round(gust)} km/h` });
  }

  // Heavy rain — daily accumulation and violent-shower codes.
  {
    const sev: Severity[] = ["good"];
    const rain = today.precipitation;
    if (rain >= 10) sev.push("warning");
    if (rain >= 25 || [65, 67, 82].includes(today.weatherCode)) sev.push("serious");
    if (rain >= 50) sev.push("critical");
    const s = maxSeverity(sev);
    if (s !== "good") out.push({ type: "rain", severity: s, value: `${rain.toFixed(1)} mm` });
  }

  // Strong wind — sustained wind speed.
  {
    const sev: Severity[] = ["good"];
    const wind = Math.max(current.windSpeed, today.windMax);
    if (wind >= 32) sev.push("warning");
    if (wind >= 45) sev.push("serious");
    if (wind >= 60) sev.push("critical");
    const s = maxSeverity(sev);
    if (s !== "good") out.push({ type: "wind", severity: s, value: `${Math.round(wind)} km/h` });
  }

  // Extreme heat — apparent (feels-like) temperature.
  {
    const sev: Severity[] = ["good"];
    const heat = Math.max(current.apparentTemperature, today.apparentMax);
    if (heat >= 38) sev.push("warning");
    if (heat >= 42) sev.push("serious");
    if (heat >= 45) sev.push("critical");
    const s = maxSeverity(sev);
    if (s !== "good") out.push({ type: "heat", severity: s, value: `${Math.round(heat)}°` });
  }

  // River flood — only for river cities, driven by 3-day rain accumulation.
  if (RIVER_CITY[slug]) {
    const sev: Severity[] = ["good"];
    const rain3 = daily.slice(0, 3).reduce((s, d) => s + d.precipitation, 0);
    if (rain3 >= 20) sev.push("warning");
    if (rain3 >= 45) sev.push("serious");
    if (rain3 >= 80) sev.push("critical");
    const s = maxSeverity(sev);
    if (s !== "good") out.push({ type: "flood", severity: s, value: `${Math.round(rain3)} mm/3d` });
  }

  // Sort most-severe first.
  return out.sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);
}

// ── Open-Meteo fetch ─────────────────────────────────────────────────────────

const CURRENT_FIELDS = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "is_day",
  "precipitation",
  "weather_code",
  "cloud_cover",
  "pressure_msl",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
].join(",");

const DAILY_FIELDS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "apparent_temperature_max",
  "precipitation_sum",
  "precipitation_probability_max",
  "wind_speed_10m_max",
  "wind_gusts_10m_max",
  "wind_direction_10m_dominant",
  "uv_index_max",
  "sunrise",
  "sunset",
].join(",");

const HOURLY_FIELDS = ["temperature_2m", "precipitation"].join(",");

type RawLocation = {
  current: Record<string, number>;
  daily: Record<string, (number | string)[]>;
  hourly?: Record<string, (number | string)[]>;
};

function num(v: number | string | undefined, fallback = 0): number {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

function shape(city: City, raw: RawLocation): CityWeather {
  const c = raw.current;
  const current: CurrentWeather = {
    temperature: num(c.temperature_2m),
    apparentTemperature: num(c.apparent_temperature),
    humidity: num(c.relative_humidity_2m),
    isDay: num(c.is_day) === 1,
    precipitation: num(c.precipitation),
    weatherCode: num(c.weather_code),
    cloudCover: num(c.cloud_cover),
    pressure: num(c.pressure_msl),
    windSpeed: num(c.wind_speed_10m),
    windDirection: num(c.wind_direction_10m),
    windGusts: num(c.wind_gusts_10m),
  };

  const d = raw.daily;
  const days = Array.isArray(d.time) ? d.time.length : 0;
  const daily: ForecastDay[] = [];
  for (let i = 0; i < days; i++) {
    daily.push({
      date: String(d.time[i]),
      weatherCode: num(d.weather_code?.[i]),
      tempMax: num(d.temperature_2m_max?.[i]),
      tempMin: num(d.temperature_2m_min?.[i]),
      apparentMax: num(d.apparent_temperature_max?.[i]),
      precipitation: num(d.precipitation_sum?.[i]),
      precipitationProbability: num(d.precipitation_probability_max?.[i]),
      windMax: num(d.wind_speed_10m_max?.[i]),
      windGustMax: num(d.wind_gusts_10m_max?.[i]),
      windDirection: num(d.wind_direction_10m_dominant?.[i]),
      uvIndexMax: num(d.uv_index_max?.[i]),
      sunrise: String(d.sunrise?.[i] ?? ""),
      sunset: String(d.sunset?.[i] ?? ""),
    });
  }

  const h = raw.hourly;
  const hourly: HourlyPoint[] = [];
  if (h && Array.isArray(h.time)) {
    for (let i = 0; i < h.time.length; i++) {
      hourly.push({ time: String(h.time[i]), temp: num(h.temperature_2m?.[i]), precip: num(h.precipitation?.[i]) });
    }
  }

  const warnings = daily.length ? computeWarnings(current, daily, city.slug) : [];
  const severity = maxSeverity(warnings.map((w) => w.severity));
  return { city, current, daily, hourly, warnings, severity };
}

export class WeatherError extends Error {}

// One request for all cities. `cache()` dedupes within a render; `revalidate`
// keeps it cheap on repeat visits and gentle on slow connections.
export const getAllWeather = cache(async (): Promise<CityWeather[]> => {
  const lat = CITIES.map((c) => c.lat).join(",");
  const lon = CITIES.map((c) => c.lon).join(",");
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=${CURRENT_FIELDS}&daily=${DAILY_FIELDS}&hourly=${HOURLY_FIELDS}` +
    `&timezone=Africa%2FMogadishu&forecast_days=7&forecast_hours=24&wind_speed_unit=kmh`;

  let res: Response;
  try {
    res = await fetch(url, { next: { revalidate: 900 } });
  } catch {
    throw new WeatherError("network");
  }
  if (!res.ok) throw new WeatherError(`http ${res.status}`);

  const data = (await res.json()) as RawLocation | RawLocation[];
  const list = Array.isArray(data) ? data : [data];
  if (list.length !== CITIES.length) throw new WeatherError("shape");

  return CITIES.map((city, i) => shape(city, list[i]));
});

export async function getCityWeather(slug: string): Promise<CityWeather | undefined> {
  const all = await getAllWeather();
  return all.find((w) => w.city.slug === slug);
}

// ── Marine / fishing conditions (coastal cities only) ────────────────────────

export type Marine = {
  waveHeight: number; // m
  wavePeriod: number; // s
  waveDirection: number; // deg
  rating: "good" | "caution" | "danger";
};

// Fishing suitability from sea state + local wind.
function rateSea(waveHeight: number, windSpeed: number): Marine["rating"] {
  if (waveHeight >= 2.5 || windSpeed >= 40) return "danger";
  if (waveHeight >= 1.25 || windSpeed >= 25) return "caution";
  return "good";
}

export const getMarine = cache(async (): Promise<Record<string, Marine>> => {
  const coastal = CITIES.filter((c) => (COASTAL_CITIES as readonly string[]).includes(c.slug));
  const lat = coastal.map((c) => c.lat).join(",");
  const lon = coastal.map((c) => c.lon).join(",");
  const url =
    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
    `&current=wave_height,wave_period,wave_direction&timezone=Africa%2FMogadishu`;

  const out: Record<string, Marine> = {};
  let res: Response;
  try {
    res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return out;
  } catch {
    return out; // marine data is a bonus — never block the page on it
  }
  const data = (await res.json()) as RawLocation | RawLocation[];
  const list = Array.isArray(data) ? data : [data];
  const weather = await getAllWeather().catch(() => [] as CityWeather[]);

  coastal.forEach((city, i) => {
    const cur = list[i]?.current;
    if (!cur) return;
    const waveHeight = num(cur.wave_height);
    const wind = weather.find((w) => w.city.slug === city.slug)?.current.windSpeed ?? 0;
    out[city.slug] = {
      waveHeight,
      wavePeriod: num(cur.wave_period),
      waveDirection: num(cur.wave_direction),
      rating: rateSea(waveHeight, wind),
    };
  });
  return out;
});

export async function getCityMarine(slug: string): Promise<Marine | undefined> {
  if (!(COASTAL_CITIES as readonly string[]).includes(slug)) return undefined;
  const all = await getMarine();
  return all[slug];
}

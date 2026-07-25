import type { Severity, WarningType } from "./weather";

export type Lang = "so" | "en";

export function normalizeLang(v: string | string[] | undefined): Lang {
  const s = Array.isArray(v) ? v[0] : v;
  return s === "en" ? "en" : "so"; // Somali is the default
}

type Dict = {
  appName: string;
  tagline: string;
  nationwide: string;
  liveMap: string;
  mapHint: string;
  cities: string;
  now: string;
  feelsLike: string;
  humidity: string;
  wind: string;
  gusts: string;
  pressure: string;
  cloud: string;
  rain: string;
  uv: string;
  sunrise: string;
  sunset: string;
  forecast7: string;
  today: string;
  allCalm: string;
  allCalmHint: string;
  activeWarnings: string;
  warningsAt: (n: number) => string;
  viewCity: string;
  back: string;
  updated: string;
  offline: string;
  errorTitle: string;
  errorBody: string;
  retry: string;
  high: string;
  low: string;
  chance: string;
  windDir: string;
  langLabel: string;
  otherLang: string;
  dataBy: string;
  hour: string;
  prayerTitle: string;
  nextPrayer: string;
  prayers: Record<"fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha", string>;
  seaTitle: string;
  waveHeight: string;
  wavePeriod: string;
  waveDir: string;
  seaRating: Record<"good" | "caution" | "danger", string>;
  riverWatch: (river: string) => string;
  severity: Record<Severity, string>;
  warning: Record<WarningType, { title: string; short: string }>;
  weekdays: string[]; // Sun..Sat
  months: string[];
  compass: string[]; // 8 points N..NW
};

const so: Dict = {
  appName: "Digniin",
  tagline: "Cimilada & digniinaha Soomaaliya",
  nationwide: "Guud ahaan dalka",
  liveMap: "Khariidad tooska ah",
  mapHint: "Taabo magaalo si aad u aragto faahfaahin",
  cities: "Magaalooyinka",
  now: "Hadda",
  feelsLike: "Waxay u dareemaysaa",
  humidity: "Qoyaan",
  wind: "Dabayl",
  gusts: "Dabaylo degdeg ah",
  pressure: "Cadaadis",
  cloud: "Daruur",
  rain: "Roob",
  uv: "Qorraxda (UV)",
  sunrise: "Qorrax-soo-baxa",
  sunset: "Qorrax-dhaca",
  forecast7: "Saadaasha 7 maalmood",
  today: "Maanta",
  allCalm: "Xaalad degan",
  allCalmHint: "Wax digniin ah oo firfircoon ma jiraan magaalooyinka la daboolay.",
  activeWarnings: "Digniinaha firfircoon",
  warningsAt: (n) => `${n} magaalo oo digniin leh`,
  viewCity: "Fiiri magaalada",
  back: "Dib u noqo",
  updated: "La cusboonaysiiyay",
  offline: "Ma jiro internet — waxaa la tusayaa xogtii ugu dambaysay.",
  errorTitle: "Xog lama helin",
  errorBody: "Ma awoodin in la helo xogta cimilada. Fadlan hubi internetkaaga oo mar kale isku day.",
  retry: "Mar kale isku day",
  high: "Sare",
  low: "Hoose",
  chance: "Suurtogal roob",
  windDir: "Jihada dabaysha",
  langLabel: "Luqad",
  otherLang: "English",
  dataBy: "Xogta: Open-Meteo",
  hour: "Saacad",
  prayerTitle: "Waqtiyada salaadda",
  nextPrayer: "Salaadda xigta",
  prayers: {
    fajr: "Subax",
    sunrise: "Qorrax-soo-bax",
    dhuhr: "Duhur",
    asr: "Casar",
    maghrib: "Maqrib",
    isha: "Cisha",
  },
  seaTitle: "Xaalada badda & kalluumaysiga",
  waveHeight: "Dhererka mawjadda",
  wavePeriod: "Muddada mawjadda",
  waveDir: "Jihada mawjadda",
  seaRating: {
    good: "Wanaagsan",
    caution: "Digtoonow",
    danger: "Khatar",
  },
  riverWatch: (r) => `Ilaalada webiga ${r}`,
  severity: {
    good: "Degan",
    warning: "Digrii",
    serious: "Halis",
    critical: "Khatar weyn",
  },
  warning: {
    storm: { title: "Duufaan", short: "Duufaan" },
    rain: { title: "Roob culus", short: "Roob" },
    wind: { title: "Dabayl xooggan", short: "Dabayl" },
    heat: { title: "Kulayl daran", short: "Kulayl" },
    flood: { title: "Fatahaad webi", short: "Fatahaad" },
  },
  weekdays: ["Axad", "Isniin", "Talaado", "Arbaco", "Khamiis", "Jimco", "Sabti"],
  months: [
    "Jan", "Feb", "Mar", "Abr", "May", "Jun",
    "Lul", "Ogos", "Sebt", "Okt", "Nof", "Dis",
  ],
  compass: ["W", "WB", "B", "KB", "K", "KG", "G", "WG"], // Waqooyi..
};

const en: Dict = {
  appName: "Digniin",
  tagline: "Somalia weather & warnings",
  nationwide: "Nationwide",
  liveMap: "Live map",
  mapHint: "Tap a city to see details",
  cities: "Cities",
  now: "Now",
  feelsLike: "Feels like",
  humidity: "Humidity",
  wind: "Wind",
  gusts: "Gusts",
  pressure: "Pressure",
  cloud: "Cloud",
  rain: "Rain",
  uv: "UV index",
  sunrise: "Sunrise",
  sunset: "Sunset",
  forecast7: "7-day forecast",
  today: "Today",
  allCalm: "All calm",
  allCalmHint: "No active warnings across the covered cities.",
  activeWarnings: "Active warnings",
  warningsAt: (n) => `${n} ${n === 1 ? "city" : "cities"} with warnings`,
  viewCity: "View city",
  back: "Back",
  updated: "Updated",
  offline: "No connection — showing the last available data.",
  errorTitle: "No data",
  errorBody: "Couldn't load weather data. Please check your connection and try again.",
  retry: "Try again",
  high: "High",
  low: "Low",
  chance: "Rain chance",
  windDir: "Wind direction",
  langLabel: "Language",
  otherLang: "Soomaali",
  dataBy: "Data: Open-Meteo",
  hour: "Hour",
  prayerTitle: "Prayer times",
  nextPrayer: "Next prayer",
  prayers: {
    fajr: "Fajr",
    sunrise: "Sunrise",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
  },
  seaTitle: "Sea & fishing conditions",
  waveHeight: "Wave height",
  wavePeriod: "Wave period",
  waveDir: "Wave direction",
  seaRating: {
    good: "Good",
    caution: "Caution",
    danger: "Dangerous",
  },
  riverWatch: (r) => `${r} river watch`,
  severity: {
    good: "Calm",
    warning: "Advisory",
    serious: "Serious",
    critical: "Severe",
  },
  warning: {
    storm: { title: "Storm", short: "Storm" },
    rain: { title: "Heavy rain", short: "Rain" },
    wind: { title: "Strong wind", short: "Wind" },
    heat: { title: "Extreme heat", short: "Heat" },
    flood: { title: "River flood", short: "Flood" },
  },
  weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ],
  compass: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
};

const DICTS: Record<Lang, Dict> = { so, en };

export function dict(lang: Lang): Dict {
  return DICTS[lang];
}

// Format an ISO date (yyyy-mm-dd) using the localized weekday/month tables.
export function formatDay(iso: string, d: Dict): { weekday: string; date: string } {
  const dt = new Date(iso + "T00:00:00");
  return {
    weekday: d.weekdays[dt.getDay()],
    date: `${dt.getDate()} ${d.months[dt.getMonth()]}`,
  };
}

// Compass label for a meteorological "from" bearing in degrees.
export function compassPoint(deg: number, d: Dict): string {
  const idx = Math.round(((deg % 360) / 45)) % 8;
  return d.compass[idx];
}

// Local time-of-day (HH:MM) from an ISO datetime string.
export function formatTime(iso: string): string {
  if (!iso) return "—";
  const t = iso.split("T")[1] ?? "";
  return t.slice(0, 5);
}

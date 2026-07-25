// Prayer-time calculation from sun position (Muslim World League angles:
// Fajr 18°, Isha 17°; Asr = Shafi'i shadow factor 1). Somalia is UTC+3 with no
// DST, so a fixed offset is correct nationwide.

const TZ = 3;
const FAJR_ANGLE = 18;
const ISHA_ANGLE = 17;

export type PrayerName = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
export type PrayerTime = { name: PrayerName; minutes: number; label: string };

const dsin = (d: number) => Math.sin((d * Math.PI) / 180);
const dcos = (d: number) => Math.cos((d * Math.PI) / 180);
const dtan = (d: number) => Math.tan((d * Math.PI) / 180);
const dacot = (x: number) => (Math.atan2(1, x) * 180) / Math.PI;
const dacos = (x: number) => (Math.acos(x) * 180) / Math.PI;

function julian(y: number, m: number, d: number): number {
  if (m <= 2) { y -= 1; m += 12; }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
}

// Sun declination & equation of time for a given Julian day.
function sunPosition(jd: number): { decl: number; eqt: number } {
  const d = jd - 2451545.0;
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const l = (q + 1.915 * dsin(g) + 0.020 * dsin(2 * g)) % 360;
  const e = 23.439 - 0.00000036 * d;
  const decl = (Math.asin(dsin(e) * dsin(l)) * 180) / Math.PI;
  const ra = (Math.atan2(dcos(e) * dsin(l), dcos(l)) * 180) / Math.PI / 15;
  const eqt = q / 15 - ((ra + 24) % 24);
  return { decl, eqt };
}

// Hour angle (in hours) for the sun to reach a given altitude `angle` below horizon.
function hourAngle(angle: number, lat: number, decl: number): number {
  const x = (-dsin(angle) - dsin(lat) * dsin(decl)) / (dcos(lat) * dcos(decl));
  if (x < -1 || x > 1) return NaN; // sun never reaches this altitude (high latitudes)
  return dacos(x) / 15;
}

export function prayerTimes(lat: number, lon: number, date = new Date()): PrayerTime[] {
  // work in Mogadishu local date
  const local = new Date(date.getTime() + TZ * 3600 * 1000);
  const jd = julian(local.getUTCFullYear(), local.getUTCMonth() + 1, local.getUTCDate());
  const { decl, eqt } = sunPosition(jd);

  const dhuhr = 12 + TZ - lon / 15 - eqt; // solar noon (hours, local)
  const rise = dhuhr - hourAngle(0.833, lat, decl);
  const set = dhuhr + hourAngle(0.833, lat, decl);
  const fajr = dhuhr - hourAngle(FAJR_ANGLE, lat, decl);
  const isha = dhuhr + hourAngle(ISHA_ANGLE, lat, decl);
  // Asr: shadow length = object + shadow factor (1) at noon
  const asrAngle = -dacot(1 + dtan(Math.abs(lat - decl)));
  const asr = dhuhr + hourAngle(asrAngle, lat, decl);

  const toMin = (h: number) => Math.round(((h % 24) + 24) % 24 * 60);
  const fmt = (h: number) => {
    const m = toMin(h);
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  };
  const mk = (name: PrayerName, h: number): PrayerTime => ({ name, minutes: toMin(h), label: fmt(h) });

  return [
    mk("fajr", fajr),
    mk("sunrise", rise),
    mk("dhuhr", dhuhr),
    mk("asr", asr),
    mk("maghrib", set),
    mk("isha", isha),
  ];
}

// Index of the next upcoming prayer given the current Mogadishu time.
export function nextPrayerIndex(times: PrayerTime[], date = new Date()): number {
  const local = new Date(date.getTime() + TZ * 3600 * 1000);
  const nowMin = local.getUTCHours() * 60 + local.getUTCMinutes();
  const idx = times.findIndex((p) => p.minutes > nowMin);
  return idx === -1 ? 0 : idx; // wrap to tomorrow's Fajr
}

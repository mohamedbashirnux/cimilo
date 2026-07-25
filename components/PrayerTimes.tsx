import { dict, type Lang } from "@/lib/i18n";
import { prayerTimes, nextPrayerIndex, type PrayerName } from "@/lib/prayer";

const ICON: Record<PrayerName, string> = {
  fajr: "M12 3v2M5 8l1.4 1.4M3 15h18M6 15a6 6 0 0 1 12 0", // dawn
  sunrise: "M12 4v3M4 20h16M6.3 11.3 4.9 9.9M12 9a5 5 0 0 1 5 5H7a5 5 0 0 1 5-5Z",
  dhuhr: "M12 4v2M4.9 6.3 6.3 7.7M12 8a5 5 0 1 1 0 10 5 5 0 0 1 0-10ZM4 13H2M22 13h-2",
  asr: "M12 6a5 5 0 1 1 0 10 5 5 0 0 1 0-10ZM19 12h2M3 12h1",
  maghrib: "M12 20v-3M4 4h16M6.3 12.7 4.9 14.1M12 15a5 5 0 0 0 5-5H7a5 5 0 0 0 5 5Z",
  isha: "M17 12a5 5 0 1 1-6-5 4 4 0 0 0 6 5Z",
};

// Prayer times for a city, computed from the sun's position. Next prayer is
// highlighted. Useful daily, and fits the Somali audience.
export function PrayerTimes({ lat, lon, lang }: { lat: number; lon: number; lang: Lang }) {
  const t = dict(lang);
  const times = prayerTimes(lat, lon);
  const nextIdx = nextPrayerIndex(times);

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-surface-1 p-4">
      <div className="mb-3 flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" aria-hidden>
          <path d="M4 21V10l8-6 8 6v11M9 21v-6h6v6" />
        </svg>
        <h2 className="text-sm font-semibold text-ink-2">{t.prayerTitle}</h2>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {times.map((p, i) => {
          const on = i === nextIdx;
          return (
            <div
              key={p.name}
              className="flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-center"
              style={
                on
                  ? { background: "color-mix(in srgb, var(--brand) 16%, transparent)", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--brand) 45%, transparent)" }
                  : { background: "var(--surface-2)" }
              }
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={on ? "var(--brand)" : "var(--muted)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={ICON[p.name]} />
              </svg>
              <span className={`text-[11px] ${on ? "font-semibold text-brand" : "text-muted"}`}>{t.prayers[p.name]}</span>
              <span className={`tnum text-sm font-semibold ${on ? "text-ink" : "text-ink-2"}`}>{p.label}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-2.5 text-xs text-muted">
        {t.nextPrayer}: <span className="font-medium text-brand">{t.prayers[times[nextIdx].name]} {times[nextIdx].label}</span>
      </p>
    </div>
  );
}

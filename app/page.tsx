import { getAllWeather, codeInfo, maxSeverity, type Severity } from "@/lib/weather";
import { project } from "@/lib/cities";
import { dict, normalizeLang, type Lang } from "@/lib/i18n";
import { MapSwitcher } from "@/components/MapSwitcher";
import type { MapCity } from "@/components/maps/types";
import { CityWeatherCard } from "@/components/CityWeatherCard";
import { LangSwitch } from "@/components/LangSwitch";
import { SEVERITY_COLOR } from "@/components/warnings";
import { WarningIcon } from "@/components/glyphs";

export const revalidate = 900;

export default async function Home({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const lang: Lang = normalizeLang((await searchParams).lang);
  const t = dict(lang);

  let all;
  try {
    all = await getAllWeather();
  } catch {
    return <ErrorState lang={lang} />;
  }

  const mapCities: MapCity[] = all.map((w) => {
    const { x, y } = project(w.city.lon, w.city.lat);
    const info = codeInfo(w.current.weatherCode);
    return {
      slug: w.city.slug,
      name: w.city.name,
      region: w.city.region,
      lat: w.city.lat,
      lon: w.city.lon,
      x,
      y,
      severity: w.severity,
      temp: w.current.temperature,
      windSpeed: w.current.windSpeed,
      windGusts: w.current.windGusts,
      windDirection: w.current.windDirection,
      glyph: info.glyph,
      isDay: w.current.isDay,
      condition: lang === "so" ? info.so : info.en,
      precip: w.current.precipitation,
      hourlyTemps: w.hourly.map((h) => h.temp),
      warnings: w.warnings,
    };
  });
  const hourlyTimes = all[0]?.hourly.map((h) => h.time) ?? [];

  const alerted = all.filter((w) => w.severity !== "good");
  const topSeverity: Severity = maxSeverity(all.map((w) => w.severity));
  const sorted = [...all].sort((a, b) => severityRank(b.severity) - severityRank(a.severity));

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-5">
      {/* header */}
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Logo />
          <div>
            <h1 className="text-xl font-bold leading-none tracking-tight text-ink">{t.appName}</h1>
            <p className="mt-0.5 text-xs text-muted">{t.tagline}</p>
          </div>
        </div>
        <LangSwitch lang={lang} />
      </header>

      {/* national status banner */}
      <NationalBanner lang={lang} alertedCount={alerted.length} topSeverity={topSeverity} />

      {/* live map */}
      <section className="mt-4">
        <SectionLabel>{t.liveMap}</SectionLabel>
        <MapSwitcher cities={mapCities} lang={lang} hourlyTimes={hourlyTimes} />
      </section>

      {/* city grid */}
      <section className="mt-6">
        <SectionLabel>{t.cities}</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sorted.map((w) => (
            <CityWeatherCard key={w.city.slug} data={w} lang={lang} />
          ))}
        </div>
      </section>

      <footer className="mt-8 text-center text-xs text-muted">
        <span>Digniin · Soomaaliya</span>
      </footer>
    </div>
  );
}

function severityRank(s: Severity): number {
  return { good: 0, warning: 1, serious: 2, critical: 3 }[s];
}

function NationalBanner({ lang, alertedCount, topSeverity }: { lang: Lang; alertedCount: number; topSeverity: Severity }) {
  const t = dict(lang);
  if (alertedCount === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-surface-1 p-4">
        <span className="grid size-10 place-items-center rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--good) 18%, transparent)", color: "var(--good)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <div>
          <p className="font-semibold text-ink">{t.allCalm}</p>
          <p className="text-xs text-ink-2">{t.allCalmHint}</p>
        </div>
      </div>
    );
  }
  const color = SEVERITY_COLOR[topSeverity];
  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-4"
      style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, var(--surface-1))`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 38%, transparent)` }}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${color} 22%, transparent)`, color }}>
        <WarningIcon type="storm" size={22} />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-ink">{t.activeWarnings}</p>
        <p className="text-xs" style={{ color }}>{t.warningsAt(alertedCount)} · {t.severity[topSeverity]}</p>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2 px-1 text-sm font-semibold text-ink-2">{children}</h2>;
}

function Logo() {
  return (
    <span className="grid size-10 place-items-center rounded-xl bg-surface-1" style={{ boxShadow: "inset 0 0 0 1px var(--border-strong)" }} aria-hidden>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L3 7v6c0 5 3.8 8.3 9 9 5.2-.7 9-4 9-9V7z" fill="color-mix(in srgb, var(--brand) 14%, transparent)" />
        <path d="M12 8l-2.5 4H13l-2.5 4" stroke="var(--warning)" />
      </svg>
    </span>
  );
}

function ErrorState({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 grid size-14 place-items-center rounded-full bg-surface-1" style={{ color: "var(--serious)", boxShadow: "inset 0 0 0 1px var(--border-strong)" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M10.3 3.7L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0z" />
          <line x1="12" y1="9" x2="12" y2="13" /><circle cx="12" cy="17" r="0.6" fill="currentColor" />
        </svg>
      </span>
      <h1 className="text-lg font-semibold text-ink">{t.errorTitle}</h1>
      <p className="mt-1 text-sm text-ink-2">{t.errorBody}</p>
      <a href={`/?lang=${lang}`} className="mt-5 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-[#04121f] hover:opacity-90">
        {t.retry}
      </a>
    </div>
  );
}

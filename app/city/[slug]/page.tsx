import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCityWeather, getCityMarine, codeInfo } from "@/lib/weather";
import { cityBySlug, CITIES } from "@/lib/cities";
import { compassPoint, dict, formatTime, normalizeLang, type Lang } from "@/lib/i18n";
import { WeatherGlyph } from "@/components/glyphs";
import { WindCompass } from "@/components/WindCompass";
import { ForecastChart } from "@/components/ForecastChart";
import { WarningRow, SEVERITY_COLOR } from "@/components/warnings";
import { LangSwitch } from "@/components/LangSwitch";
import { PrayerTimes } from "@/components/PrayerTimes";
import { SeaConditions } from "@/components/SeaConditions";

export const revalidate = 900;

export function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const city = cityBySlug((await params).slug);
  return { title: city ? `${city.name} — Digniin` : "Digniin" };
}

export default async function CityPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const lang: Lang = normalizeLang((await searchParams).lang);
  const t = dict(lang);

  const city = cityBySlug(slug);
  if (!city) notFound();

  const data = await getCityWeather(slug);
  if (!data) notFound();
  const marine = await getCityMarine(slug);

  const { current, daily, warnings, severity } = data;
  const info = codeInfo(current.weatherCode);
  const today = daily[0];
  const accent = SEVERITY_COLOR[severity];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-5">
      {/* header */}
      <header className="mb-4 flex items-center justify-between gap-3">
        <Link href={`/?lang=${lang}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          {t.back}
        </Link>
        <LangSwitch lang={lang} />
      </header>

      {/* hero current conditions */}
      <section
        className="rounded-2xl border border-[color:var(--border)] p-5"
        style={{ background: `radial-gradient(120% 120% at 85% 0%, color-mix(in srgb, ${accent} 12%, var(--surface-1)), var(--surface-1))` }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">{city.name}</h1>
            <p className="text-sm text-muted">{city.region}</p>
          </div>
          <WeatherGlyph glyph={info.glyph} day={current.isDay} size={64} />
        </div>
        <div className="mt-3 flex items-end gap-4">
          <span className="tnum text-6xl font-bold leading-none text-ink">{Math.round(current.temperature)}°</span>
          <div className="pb-1">
            <p className="text-sm font-medium text-ink">{lang === "so" ? info.so : info.en}</p>
            <p className="tnum text-xs text-ink-2">
              {t.feelsLike} {Math.round(current.apparentTemperature)}° · {t.high} {Math.round(today.tempMax)}° {t.low} {Math.round(today.tempMin)}°
            </p>
          </div>
        </div>
      </section>

      {/* active warnings */}
      {warnings.length > 0 && (
        <section className="mt-4 space-y-2">
          <h2 className="px-1 text-sm font-semibold text-ink-2">{t.activeWarnings}</h2>
          {warnings.map((w) => (
            <WarningRow key={w.type} warning={w} lang={lang} />
          ))}
        </section>
      )}

      {/* wind + key stats */}
      <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr]">
        <div className="grid place-items-center rounded-2xl border border-[color:var(--border)] bg-surface-1 p-4">
          <span className="mb-1 text-xs font-medium text-ink-2">{t.windDir}</span>
          <WindCompass direction={current.windDirection} speed={current.windSpeed} gusts={current.windGusts} lang={lang} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat label={t.feelsLike} value={`${Math.round(current.apparentTemperature)}°`} />
          <Stat label={t.humidity} value={`${Math.round(current.humidity)}%`} />
          <Stat label={t.rain} value={`${current.precipitation.toFixed(1)} mm`} />
          <Stat label={t.chance} value={`${Math.round(today.precipitationProbability)}%`} />
          <Stat label={t.cloud} value={`${Math.round(current.cloudCover)}%`} />
          <Stat label={t.pressure} value={`${Math.round(current.pressure)}`} unit="hPa" />
          <Stat label={t.uv} value={`${Math.round(today.uvIndexMax)}`} />
          <Stat label={t.gusts} value={`${Math.round(current.windGusts)}`} unit="km/h" />
          <Stat label={t.sunrise} value={formatTime(today.sunrise)} />
          <Stat label={t.sunset} value={formatTime(today.sunset)} />
        </div>
      </section>

      {/* sea / fishing (coastal cities only) */}
      {marine && (
        <section className="mt-4">
          <SeaConditions marine={marine} lang={lang} />
        </section>
      )}

      {/* 7-day forecast */}
      <section className="mt-6">
        <h2 className="mb-2 px-1 text-sm font-semibold text-ink-2">{t.forecast7}</h2>
        <ForecastChart days={daily} lang={lang} />
      </section>

      {/* prayer times */}
      <section className="mt-6">
        <PrayerTimes lat={city.lat} lon={city.lon} lang={lang} />
      </section>

      <footer className="mt-8 flex items-center justify-between text-xs text-muted">
        <span>Digniin</span>
        <span className="tnum">{compassPoint(current.windDirection, t)} · {Math.round(current.windSpeed)} km/h</span>
      </footer>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-surface-1 p-3.5">
      <p className="text-xs text-muted">{label}</p>
      <p className="tnum mt-1 text-lg font-semibold text-ink">
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-muted">{unit}</span>}
      </p>
    </div>
  );
}

import Link from "next/link";
import type { CityWeather } from "@/lib/weather";
import { codeInfo } from "@/lib/weather";
import { dict, type Lang } from "@/lib/i18n";
import { WeatherGlyph } from "./glyphs";
import { WarningBadge, SEVERITY_COLOR } from "./warnings";

export function CityWeatherCard({ data, lang }: { data: CityWeather; lang: Lang }) {
  const t = dict(lang);
  const { city, current, warnings, severity } = data;
  const info = codeInfo(current.weatherCode);
  const color = SEVERITY_COLOR[severity];

  return (
    <Link
      href={`/city/${city.slug}?lang=${lang}`}
      className="group relative block overflow-hidden rounded-2xl border border-[color:var(--border)] bg-surface-1 p-4 transition-colors hover:border-[color:var(--border-strong)] hover:bg-surface-2"
    >
      {/* severity accent edge */}
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: color }} aria-hidden />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-ink">{city.name}</h3>
          <p className="truncate text-xs text-muted">{city.region}</p>
        </div>
        <WeatherGlyph glyph={info.glyph} day={current.isDay} size={40} className="-mt-1 shrink-0" />
      </div>

      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          <span className="tnum text-3xl font-bold leading-none text-ink">{Math.round(current.temperature)}°</span>
          <p className="mt-1 truncate text-xs text-ink-2">{lang === "so" ? info.so : info.en}</p>
        </div>
        <div className="tnum text-right text-xs text-muted">
          <div>{t.wind} {Math.round(current.windSpeed)}</div>
          <div>{t.humidity} {Math.round(current.humidity)}%</div>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {warnings.map((w) => (
            <WarningBadge key={w.type} warning={w} lang={lang} size="sm" />
          ))}
        </div>
      )}
    </Link>
  );
}

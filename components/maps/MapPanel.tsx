import Link from "next/link";
import type { Severity } from "@/lib/weather";
import { compassPoint, dict, type Lang } from "@/lib/i18n";
import { SEVERITY_COLOR, WarningBadge } from "@/components/warnings";
import { WeatherGlyph } from "@/components/glyphs";
import type { MapCity } from "./types";

// The selected-city detail card shown beneath every map variant.
export function MapPanel({ sel, lang }: { sel: MapCity; lang: Lang }) {
  const t = dict(lang);
  return (
    <div className="mt-3 rounded-xl border border-[color:var(--border)] bg-surface-2 p-3">
      <div className="flex items-center gap-3">
        <WeatherGlyph glyph={sel.glyph} day={sel.isDay} size={44} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="truncate font-semibold text-ink">{sel.name}</h3>
            <span className="tnum text-lg font-bold text-ink">{Math.round(sel.temp)}°</span>
          </div>
          <p className="truncate text-xs text-ink-2">{sel.condition}</p>
        </div>
        <div className="tnum shrink-0 text-right text-xs text-ink-2">
          <div className="font-medium text-ink">{Math.round(sel.windSpeed)} km/h</div>
          <div className="text-muted">{compassPoint(sel.windDirection, t)} · {t.gusts} {Math.round(sel.windGusts)}</div>
        </div>
      </div>

      {sel.warnings.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {sel.warnings.map((w) => (
            <WarningBadge key={w.type} warning={w} lang={lang} size="sm" />
          ))}
        </div>
      )}

      <Link href={`/city/${sel.slug}?lang=${lang}`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
        {t.viewCity}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
    </div>
  );
}

export function SeverityLegend({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 text-xs text-muted">
      {(["good", "warning", "serious", "critical"] as Severity[]).map((s) => (
        <span key={s} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: SEVERITY_COLOR[s] }} />
          {t.severity[s]}
        </span>
      ))}
    </div>
  );
}

// Temperature scale shown under the radar variant.
export function HeatLegend({ min, max }: { min: number; max: number }) {
  return (
    <div className="mt-3 flex items-center gap-3 px-1 text-xs text-muted">
      <span className="tnum">{Math.round(min)}°</span>
      <span className="h-1.5 flex-1 rounded-full" style={{ background: "linear-gradient(90deg,#4da3ff,#7fb2e8,#fab219,#ec835a,#d03b3b)" }} />
      <span className="tnum">{Math.round(max)}°</span>
    </div>
  );
}

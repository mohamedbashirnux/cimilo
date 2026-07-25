import { compassPoint, dict, type Lang } from "@/lib/i18n";
import type { Marine } from "@/lib/weather";

const RATING_COLOR: Record<Marine["rating"], string> = {
  good: "var(--good)",
  caution: "var(--warning)",
  danger: "var(--critical)",
};

// Sea state + fishing suitability for coastal cities (Kismaayo, Boosaaso,
// Muqdisho). Waves from Open-Meteo's marine model.
export function SeaConditions({ marine, lang }: { marine: Marine; lang: Lang }) {
  const t = dict(lang);
  const color = RATING_COLOR[marine.rating];
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-surface-1 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M2 6c1.5 0 1.5 1.2 3 1.2S6.5 6 8 6s1.5 1.2 3 1.2S12.5 6 14 6M2 18c1.5 0 1.5-1.2 3-1.2s1.5 1.2 3 1.2M18 4l3 3-3 3M21 7H10a4 4 0 0 0-4 4v2" />
          </svg>
          <h2 className="text-sm font-semibold text-ink-2">{t.seaTitle}</h2>
        </div>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ color, backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 40%, transparent)` }}>
          {t.seaRating[marine.rating]}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <SeaStat label={t.waveHeight} value={`${marine.waveHeight.toFixed(1)}`} unit="m" />
        <SeaStat label={t.wavePeriod} value={`${marine.wavePeriod.toFixed(0)}`} unit="s" />
        <SeaStat label={t.waveDir} value={compassPoint(marine.waveDirection, t)} />
      </div>
    </div>
  );
}

function SeaStat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-3 text-center">
      <p className="text-[11px] text-muted">{label}</p>
      <p className="tnum mt-1 text-lg font-semibold text-ink">
        {value}
        {unit && <span className="ml-0.5 text-xs font-normal text-muted">{unit}</span>}
      </p>
    </div>
  );
}
